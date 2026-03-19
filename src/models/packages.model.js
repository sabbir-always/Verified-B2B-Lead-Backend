import mongoose from "mongoose";

const PackagesSchema = new mongoose.Schema({
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: true
    },
    package_name: {
        type: String,
        trim: true,
        required: true
    },
    price: {
        type: Number,
        trim: true,
        required: true
    },
    features: {
        type: Array,
        trim: true,
        default: [],
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const PackagesModel = mongoose.model("Packages", PackagesSchema);
export default PackagesModel;
