import mongoose, { Schema, model, models } from "mongoose";

const ChatRoomSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default models.ChatRoom || model("ChatRoom", ChatRoomSchema);
