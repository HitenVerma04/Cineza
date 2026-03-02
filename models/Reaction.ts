import mongoose, { Schema, model, models } from "mongoose";

const ReactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    movieId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["mind_blown", "emotional", "fun_watch"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Ensure a user can only have one reaction per movie
ReactionSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Reaction = models.Reaction || model("Reaction", ReactionSchema);

export default Reaction;
