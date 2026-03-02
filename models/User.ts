import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        select: false,
    },
    topGenres: {
        type: [String],
        default: [],
    },
    profileImage: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    friendRequests: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

const User = models.User || model("User", UserSchema);

export default User;
