import mongoose from "mongoose";

const RequestSampleSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    country: {
        type: String,
        trim: true,
        required: true
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: true
    },
    requirements: {
        type: String,
        trim: true,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
});
const RequestSampleModel = mongoose.model("RequestSample", RequestSampleSchema);
export default RequestSampleModel;