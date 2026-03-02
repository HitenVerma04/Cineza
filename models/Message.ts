import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        enum: ["global", "direct", "room"],
        required: true,
    },
    roomId: {
        type: Schema.Types.ObjectId,
        ref: "ChatRoom",
    },
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default models.Message || model("Message", MessageSchema);
