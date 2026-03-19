import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema({
    website_name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Phone is required"],
        minlength: [11, "Phone must be at least 11 characters"],
        maxlength: [11, "Phone cannot exceed 11 characters"]
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"],
        minlength: [8, "Email must be at least 8 characters"],
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    project_count: {
        type: Number,
        default: 0
    },
    clients_count: {
        type: Number,
        default: 0
    },
    expreience_count: {
        type: Number,
        default: 0
    },
    social: {
        facebook: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^https?:\/\//, "Facebook URL must start with http:// or https://"],
            default: undefined
        },
        linkedin: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^https?:\/\//, "Linkedin URL must start with http:// or https://"],
            default: undefined
        },
        twitter: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^https?:\/\//, "Twitter URL must start with http:// or https://"],
            default: undefined
        },
        instagram: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^https?:\/\//, "Instagram URL must start with http:// or https://"],
            default: undefined
        },
        telegram: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^https?:\/\//, "Telegram URL must start with http:// or https://"],
            default: undefined
        }
    },
}, { timestamps: true })
const PortfolioModel = mongoose.model("Portfolio", PortfolioSchema);
export default PortfolioModel;