import mongoose, { Schema, model, models } from "mongoose";

const WatchlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    movieId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["watching", "watched"],
        default: "watching",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Watchlist = models.Watchlist || model("Watchlist", WatchlistSchema);

export default Watchlist;
