"use client";

import { useState, useEffect, useRef } from "react";
import { UserCircle, Globe, Send, MessageCircle, Users, Loader2, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Message = {
    _id: string;
    senderId: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    text: string;
    createdAt: string;
};

type Friend = {
    _id: string;
    name: string;
    profileImage?: string;
};

export default function ChatPage() {
    const [activeTab, setActiveTab] = useState<string>("global"); // "global", friendId, or "room_roomId"
    const [friends, setFriends] = useState<Friend[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal state for creating a room
    const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    // Modal state for adding people to a room
    const [isAddPeopleModalOpen, setIsAddPeopleModalOpen] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [addingUserId, setAddingUserId] = useState<string | null>(null);

    // Modal state for viewing members of a room
    const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
    const [roomMembers, setRoomMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    // Prevent body and html scrolling, and hide global footer for full-screen chat experience
    useEffect(() => {
        window.scrollTo(0, 0); // Reset scroll position to top to perfectly align chat frame
        document.documentElement.classList.add('overflow-hidden');
        document.body.classList.add('overflow-hidden');
        const footer = document.querySelector('footer');
        if (footer) footer.style.display = 'none';

        return () => {
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
            if (footer) footer.style.display = 'block';
        };
    }, []);

    // Fetch user and friends on mount
    useEffect(() => {
        async function fetchInitialData() {
            try {
                // Fetch User profile & friends
                const userRes = await fetch("/api/users/profile");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setCurrentUser(userData);
                    setFriends(userData.friends || []);
                }

                // Fetch Chat Rooms
                const roomsRes = await fetch("/api/chat/rooms");
                if (roomsRes.ok) {
                    const roomsData = await roomsRes.json();
                    setRooms(roomsData);
                }
            } catch (error) {
                console.error("Failed to fetch initial chat data");
            }
        }
        fetchInitialData();
    }, []);

    // Fetch messages logic (polled)
    useEffect(() => {
        let isMounted = true;
        let pollInterval: NodeJS.Timeout;

        async function fetchMessages() {
            try {
                let endpoint = "";
                if (activeTab === "global") {
                    endpoint = "/api/chat/global";
                } else if (activeTab.startsWith("room_")) {
                    const roomId = activeTab.replace("room_", "");
                    endpoint = `/api/chat/room/${roomId}`;
                } else {
                    endpoint = `/api/chat/direct/${activeTab}`;
                }

                const res = await fetch(endpoint);
                if (res.ok && isMounted) {
                    const data = await res.json();

                    // Only update state if message pool has grown to prevent constant re-rendering/scrolling
                    setMessages(prev => {
                        if (data.length !== prev.length) {
                            return data;
                        }
                        return prev;
                    });

                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch messages");
            }
        }

        if (currentUser) {
            setLoading(true);
            fetchMessages();
            pollInterval = setInterval(fetchMessages, 3000); // 3-second polling
        }

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [activeTab, currentUser]);

    // Auto-scroll logic
    useEffect(() => {
        if (!loading && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length, loading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        let endpoint = "";
        if (activeTab === "global") {
            endpoint = "/api/chat/global";
        } else if (activeTab.startsWith("room_")) {
            const roomId = activeTab.replace("room_", "");
            endpoint = `/api/chat/room/${roomId}`;
        } else {
            endpoint = `/api/chat/direct/${activeTab}`;
        }

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newMessage })
            });

            if (res.ok) {
                const newMsg = await res.json();
                setMessages(prev => [...prev, newMsg]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;

        setIsCreatingRoom(true);
        try {
            const res = await fetch("/api/chat/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newRoomName })
            });

            if (res.ok) {
                const newRoom = await res.json();
                setRooms(prev => [newRoom, ...prev]);
                setNewRoomName("");
                setIsCreateRoomModalOpen(false);
                setActiveTab(`room_${newRoom._id}`);
            }
        } catch (error) {
            console.error("Failed to create room", error);
        } finally {
            setIsCreatingRoom(false);
        }
    };

    const handleOpenAddPeople = async () => {
        if (!activeTab.startsWith("room_")) return;
        setIsAddPeopleModalOpen(true);
        try {
            const roomId = activeTab.replace("room_", "");
            const res = await fetch(`/api/chat/room/${roomId}/available-users`);
            if (res.ok) {
                const usersData = await res.json();
                setAvailableUsers(usersData);
            }
        } catch (error) {
            console.error("Failed to fetch available users");
        }
    };

    const handleAddUserToRoom = async (userId: string) => {
        if (!activeTab.startsWith("room_")) return;
        setAddingUserId(userId);

        try {
            const roomId = activeTab.replace("room_", "");
            const res = await fetch(`/api/chat/room/${roomId}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                setAvailableUsers(prev => prev.filter(u => u._id !== userId));
            }
        } catch (error) {
            console.error("Failed to add user to room");
        } finally {
            setAddingUserId(null);
        }
    };

    const handleOpenViewMembers = async () => {
        if (!activeTab.startsWith("room_")) return;
        setIsViewMembersModalOpen(true);
        setIsLoadingMembers(true);
        try {
            const roomId = activeTab.replace("room_", "");
            const res = await fetch(`/api/chat/room/${roomId}/members`);
            if (res.ok) {
                const membersData = await res.json();
                setRoomMembers(membersData);
            }
        } catch (error) {
            console.error("Failed to fetch room members");
        } finally {
            setIsLoadingMembers(false);
        }
    };

    let activeChatName = "Chat";
    if (activeTab === "global") {
        activeChatName = "Global Room";
    } else if (activeTab.startsWith("room_")) {
        const roomId = activeTab.replace("room_", "");
        activeChatName = rooms.find(r => r._id === roomId)?.name || "Chat Room";
    } else {
        activeChatName = friends.find(f => f._id === activeTab)?.name || "Direct Message";
    }

    if (!currentUser) {
        return <div className="min-h-[80vh] flex items-center justify-center text-white">Loading Chat Data...</div>;
    }

    return (
        <div className="flex relative h-[calc(100dvh-64px)] w-full bg-[#030712] text-white overflow-hidden z-40">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 flex flex-col bg-transparent z-10 shrink-0 h-full min-h-0">
                <div className="p-5 border-b border-white/10">
                    <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        <MessageCircle className="w-5 h-5 text-blue-500" /> Messages
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent min-h-0">
                    {/* Public Rooms */}
                    <div>
                        <div className="flex items-center justify-between mb-3 pl-2 pr-1">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rooms</h3>
                            <button onClick={() => setIsCreateRoomModalOpen(true)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold flex items-center gap-1">
                                + New
                            </button>
                        </div>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTab("global")}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left ${activeTab === "global" ? 'bg-white/10 shadow-lg ring-1 ring-white/20 translate-x-1' : 'hover:bg-white/5 hover:translate-x-1'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTab === "global" ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20' : 'bg-zinc-800/80 group-hover:bg-zinc-700'}`}>
                                    <Globe className={`w-6 h-6 ${activeTab === "global" ? 'text-white' : 'text-zinc-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-sm truncate ${activeTab === "global" ? 'text-white' : 'text-zinc-300'}`}>Global Chat</p>
                                    <p className="text-xs text-zinc-500 truncate">Everyone on CineCircle</p>
                                </div>
                            </button>

                            {rooms.map(room => (
                                <button
                                    key={room._id}
                                    onClick={() => setActiveTab(`room_${room._id}`)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 text-left ${activeTab === `room_${room._id}` ? 'bg-white/10 shadow-lg ring-1 ring-white/20 translate-x-1' : 'hover:bg-white/5 hover:translate-x-1'}`}
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-lg bg-zinc-800 border border-white/5 relative overflow-hidden group/room ${activeTab === `room_${room._id}` ? 'ring-1 ring-blue-500/50' : ''}`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover/room:opacity-100 transition-opacity"></div>
                                        <span className="text-sm font-black text-zinc-400">#</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm truncate ${activeTab === `room_${room._id}` ? 'text-white' : 'text-zinc-300'}`}>{room.name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Direct Messages */}
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-2">Direct Messages</h3>
                        {friends.length === 0 ? (
                            <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                                <p className="text-sm text-zinc-400">No friends added yet.</p>
                                <p className="text-xs text-zinc-600 mt-1">Visit a profile to add friends.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {friends.map(friend => {
                                    if (!friend || !friend._id) return null;
                                    return (
                                        <button
                                            key={friend._id}
                                            onClick={() => setActiveTab(friend._id)}
                                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 text-left ${activeTab === friend._id ? 'bg-white/10 shadow-lg ring-1 ring-white/20 translate-x-1' : 'hover:bg-white/5 hover:translate-x-1'}`}
                                        >
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-white/10 bg-zinc-800 shadow-sm relative">
                                                {friend.profileImage ? (
                                                    <img src={friend.profileImage} alt={friend.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-zinc-300">{friend.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm truncate ${activeTab === friend._id ? 'text-white' : 'text-zinc-300'}`}>{friend.name}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-transparent relative z-10 h-full min-w-0 min-h-0">
                {/* Chat Header */}
                <div className="h-20 px-8 flex items-center justify-between shrink-0 bg-transparent border-b border-white/5 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-white/10 bg-zinc-900/80 shadow-inner flex items-center justify-center overflow-hidden shrink-0 relative backdrop-blur-sm">
                            {activeTab === "global" ? (
                                <Globe className="w-6 h-6 text-blue-400 drop-shadow-md" />
                            ) : activeTab.startsWith("room_") ? (
                                <span className="text-lg font-black text-blue-400 drop-shadow-md">#</span>
                            ) : (
                                friends.find(f => f._id === activeTab)?.profileImage ? (
                                    <img src={friends.find(f => f._id === activeTab)?.profileImage} alt="friend" className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-6 h-6 text-zinc-400 drop-shadow-md" />
                                )
                            )}
                        </div>
                        <div>
                            <h2 className="font-extrabold text-xl tracking-tight">{activeChatName}</h2>
                            <p className="text-xs text-blue-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                {activeTab === "global" ? "Public Room" : activeTab.startsWith("room_") ? "Custom Chat Room" : "Encrypted Direct Connection"}
                            </p>
                        </div>
                    </div>
                    {activeTab.startsWith("room_") && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleOpenViewMembers}
                                className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all shadow-sm"
                            >
                                <Users className="w-4 h-4" /> Members
                            </button>
                            <button
                                onClick={handleOpenAddPeople}
                                className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400 transition-all shadow-sm"
                            >
                                <UserPlus className="w-4 h-4" /> Add People
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent min-h-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-zinc-500">
                            <div className="animate-pulse flex flex-col items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin"></div>
                                <span className="text-sm font-medium tracking-widest uppercase">Securely syncing...</span>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                            <div className="w-20 h-20 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                                <MessageCircle className="w-10 h-10 text-zinc-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-400 text-center">It's quiet in here</h3>
                                <p className="text-sm text-zinc-600 text-center mt-1">Be the first to say hi to {activeTab === "global" ? "the community" : activeChatName}!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            if (!msg || !msg.senderId) return null;
                            const isMe = msg.senderId._id === currentUser._id;
                            const isLast = index === messages.length - 1;

                            return (
                                <div key={msg._id} className={`flex gap-3 max-w-full ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isLast ? 'animate-in slide-in-from-bottom-2 fade-in duration-300' : ''}`}>
                                    {/* Avatar */}
                                    {!isMe && (
                                        <Link href={`/profile/${msg.senderId._id}`} className="w-8 h-8 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 mt-3 shadow-sm hover:ring-2 hover:ring-blue-500 transition-all">
                                            {msg.senderId.profileImage ? (
                                                <img src={msg.senderId.profileImage} alt={msg.senderId.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-300">{msg.senderId.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </Link>
                                    )}

                                    {/* Bubble */}
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <div className="flex items-baseline gap-2 mb-1 px-1">
                                            {!isMe && <span className="text-xs font-bold text-zinc-400 tracking-wide">{msg.senderId.name}</span>}
                                            <span className="text-[10px] font-medium text-zinc-600">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                                        </div>
                                        <div
                                            className={`px-5 py-3 text-sm shadow-md transition-all duration-300 transform origin-bottom hover:scale-[1.01] ${isMe
                                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-blue-900/20'
                                                : 'bg-zinc-800/80 backdrop-blur-md border border-white/5 text-zinc-100 rounded-2xl rounded-tl-sm shadow-black/40'}`}
                                            style={{ wordBreak: 'break-word' }}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Message Input Container (Fixed Bottom) */}
                <div className="p-4 md:p-6 bg-transparent border-t border-white/5 shrink-0 z-20">
                    <form onSubmit={handleSendMessage} className="relative flex items-center max-w-4xl mx-auto w-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
                        <input
                            type="text"
                            name="chat-input"
                            id="chat-input"
                            placeholder={`Message ${activeChatName}...`}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="relative flex-1 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 text-sm text-white placeholder-zinc-500 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all pr-16 hover:border-white/20"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 disabled:opacity-50 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Create Room Modal */}
            {isCreateRoomModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a242f] border border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-gray-800 bg-[#0f171e]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-blue-500" /> Create Room
                            </h3>
                        </div>
                        <form onSubmit={handleCreateRoom} className="p-5 space-y-4">
                            <div>
                                <label htmlFor="roomName" className="block text-sm font-semibold text-zinc-400 mb-2">Room Name</label>
                                <input
                                    type="text"
                                    id="roomName"
                                    autoFocus
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="e.g. Marvel Fans, Sci-Fi Club"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                    maxLength={30}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateRoomModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newRoomName.trim() || isCreatingRoom}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {isCreatingRoom ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add People Modal */}
            {isAddPeopleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a242f] border border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        <div className="p-5 border-b border-gray-800 bg-[#0f171e] flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-500" /> Add to Room
                            </h3>
                            <button onClick={() => setIsAddPeopleModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold">Done</button>
                        </div>

                        <div className="overflow-y-auto p-4 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                            {availableUsers.length === 0 ? (
                                <div className="text-center text-zinc-500 py-8">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="font-semibold">No more users found.</p>
                                    <p className="text-xs mt-1">Everyone is already in this room!</p>
                                </div>
                            ) : (
                                availableUsers.map(user => {
                                    if (!user || !user._id) return null;
                                    return (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-zinc-300">{user.name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <p className="font-semibold text-sm text-zinc-200 truncate max-w-[120px]">{user.name}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAddUserToRoom(user._id)}
                                                disabled={addingUserId === user._id}
                                                className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center gap-1.5 min-w-[70px] justify-center"
                                            >
                                                {addingUserId === user._id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>+ Add</>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Members Modal */}
            {isViewMembersModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a242f] border border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        <div className="p-5 border-b border-gray-800 bg-[#0f171e] flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" /> Room Members
                            </h3>
                            <button onClick={() => setIsViewMembersModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold">Close</button>
                        </div>

                        <div className="overflow-y-auto p-4 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                            {isLoadingMembers ? (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                                </div>
                            ) : roomMembers.length === 0 ? (
                                <div className="text-center text-zinc-500 py-8">
                                    <p className="font-semibold">No members found.</p>
                                </div>
                            ) : (
                                roomMembers.map(user => {
                                    if (!user || !user._id) return null;
                                    return (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-zinc-300">{(user?.name || '?').charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <p className="font-semibold text-sm text-zinc-200 truncate max-w-[200px]">{user.name}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
