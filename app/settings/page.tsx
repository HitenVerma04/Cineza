import SettingsForm from "@/components/SettingsForm";

export const metadata = {
    title: "Settings | CineCircle",
    description: "Manage your profile and preferences.",
};

export default function SettingsPage() {
    return (
        <div className="bg-[#0f1115] min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Profile Settings</h1>
                    <p className="text-zinc-400">Update your details, avatar, and favorite cinematic genres.</p>
                </div>

                <SettingsForm />

            </div>
        </div>
    );
}
