import mongoose from "mongoose";

const TeamsSchema = new mongoose.Schema({
    date_and_time: {
        type: Date,
        default: Date.now
    },
    date_and_time_format: {
        type: String,
        default: null
    },
    first_name: {
        type: String,
        trim: true,
        required: [true, "First Name is required"],
        minlength: [3, "First Name must be at least 3 characters"],
        maxlength: [15, "First Name cannot exceed 15 characters"]
    },
    last_name: {
        type: String,
        trim: true,
        required: [true, "Last Name is required"],
        minlength: [3, "Last Name must be at least 3 characters"],
        maxlength: [15, "Last Name cannot exceed 15 characters"]
    },
    full_name: {
        type: String,
        trim: true
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
    religion: {
        type: String,
        trim: true,
        enum: ["Islam", "Hindu", "Christian", "Buddhism", "Other"],
        default: null
    },
    blood_group: {
        type: String,
        trim: true,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
        default: null
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
    attachment: {
        type: Object,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const TeamsModel = mongoose.model("Teams", TeamsSchema);
export default TeamsModel;
