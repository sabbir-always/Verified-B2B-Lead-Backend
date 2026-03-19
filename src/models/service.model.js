import mongoose from "mongoose";

const ServicesSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        default: null
    },
    features: {
        type: Array,
        trim: true,
        default: [],
    },
    attachment: {
        type: Object,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const ServicesModel = mongoose.model("Services", ServicesSchema);
export default ServicesModel;
