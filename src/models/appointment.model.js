import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    select_day: {
        type: Number,
        required: [true, "Day is required"],
        min: 1,
        max: 31
    },
    select_month: {
        type: String,
        required: [true, "Month is required"],
        enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    },
    select_time: {
        type: String,
        trim: true,
        required: [true, "Time is required"],
        enum: ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00"],
    },
    select_time_hours: {
        type: String,
        trim: true,
        required: [true, "Time Hours is required"],
        enum: ["AM", "PM"],
    },
    select_timezone: {
        type: String,
        trim: true,
        required: [true, "Timezone is required"],
        enum: ["UTC+1", "UTC+2", "UTC+3", "UTC+4", "UTC+5", "UTC+6", "UTC+7", "UTC+8", "UTC+9", "UTC+10", "UTC+11", "UTC+12", "UTC-1", "UTC-2", "UTC-3", "UTC-4", "UTC-5", "UTC-6", "UTC-7", "UTC-8", "UTC-9", "UTC-10", "UTC-11", "UTC-12"],
    },
    meeting_type: {
        type: String,
        trim: true,
        required: [true, "Meeting Type is required"],
        enum: ["whatsapp_chat", "google_meet", "zoom_meet"],
    },
    meeting_with: {
        type: String,
        trim: true,
        required: [true, "Meeting With is required"],
        enum: ["owner_founder", "digital_marketer", "project_manager", "web_developer", "graphic_designer"],
    },
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters"],
        maxlength: [15, "Name cannot exceed 15 characters"]
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Email is required"],
        minlength: [8, "Email must be at least 8 characters"],
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    phone: {
        type: String,
        trim: true,
        required: [true, "Phone is required"],
        minlength: [11, "Phone must be at least 11 characters"],
        maxlength: [11, "Phone cannot exceed 11 characters"]
    },
    country: {
        type: String,
        trim: true,
        required: [true, "Country is required"],
        minlength: [2, "Country must be at least 2 characters"],
    },
    status: {
        type: String,
        trim: true,
        enum: ["pending", "approved", "timeout", "cancel"],
        default: "pending"
    }
}, { timestamps: true });

const AppointmentModel = mongoose.model("Appointment", AppointmentSchema);
export default AppointmentModel;
