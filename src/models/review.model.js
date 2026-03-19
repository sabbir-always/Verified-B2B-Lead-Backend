import mongoose from "mongoose";

const ReviewsSchema = new mongoose.Schema({
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: true
    },
    auth_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Authentication",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

const ReviewsModel = mongoose.model("Reviews", ReviewsSchema);
export default ReviewsModel;
