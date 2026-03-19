import Joi from 'joi';

export const auth_create_schema = Joi.object({
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    user_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    email: Joi.string().email({ tlds: { allow: true } }).trim().min(8).max(50).lowercase().required(),
    password: Joi.string().min(8).max(15).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])')).required()
        .messages({
            "string.min": "Password must be at least 8 characters long",
            "string.pattern.base": "Password must contain uppercase, lowercase, number and special character",
            "any.required": "Password is required"
        }),

    confirm_password: Joi.string().valid(Joi.ref('password')).required()
        .messages({
            "any.only": "Confirm password must match password",
            "any.required": "Confirm password is required"
        })
})

export const auth_update_schema = Joi.object({
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    user_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    email: Joi.string().email({ tlds: { allow: true } }).trim().min(8).max(50).lowercase().required(),
})

export const auth_signin_schema = Joi.object({
    users: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
})

export const teams_schema = Joi.object({
    first_name: Joi.string().trim().min(3).max(15).required(),
    last_name: Joi.string().trim().min(3).max(15).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    email: Joi.string().email().trim().min(8).lowercase().required(),
    blood_group: Joi.string().valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-").optional().empty("").allow(null),
    religion: Joi.string().valid("Islam", "Hindu", "Christian", "Buddhism", "Other").optional().empty("").allow(null),
    social: Joi.object({
        facebook: Joi.string().pattern(/^https?:\/\//).optional().empty("").allow(null),
        linkedin: Joi.string().pattern(/^https?:\/\//).optional().empty("").allow(null),
        twitter: Joi.string().pattern(/^https?:\/\//).optional().empty("").allow(null),
        instagram: Joi.string().pattern(/^https?:\/\//).optional().empty("").allow(null),
        telegram: Joi.string().pattern(/^https?:\/\//).optional().empty("").allow(null)
    }).optional(),
    isActive: Joi.boolean().optional()
})

export const service_schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    features: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid("active", "inactive").optional()
});

export const packages_schema = Joi.object({
    service_id: Joi.string().required(),
    package_name: Joi.string().required(),
    price: Joi.number().required(),
    features: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid("active", "inactive").optional()
});

export const reviews_schema = Joi.object({
    service_id: Joi.string().required(),
    auth_id: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5).message("Rating must be between 1 and 5"),
    comment: Joi.string().max(500).optional().empty("").allow(null),
    status: Joi.string().valid("pending", "approved", "rejected").optional()
});

export const appointment_schema = Joi.object({
    select_day: Joi.number().min(1).max(31).required(),
    select_month: Joi.string().valid("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December").required(),
    select_time: Joi.string().valid("01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00").required(),
    select_time_hours: Joi.string().valid("AM", "PM").required(),
    select_timezone: Joi.string().valid("UTC+1", "UTC+2", "UTC+3", "UTC+4", "UTC+5", "UTC+6", "UTC+7", "UTC+8", "UTC+9", "UTC+10", "UTC+11", "UTC+12", "UTC-1", "UTC-2", "UTC-3", "UTC-4", "UTC-5", "UTC-6", "UTC-7", "UTC-8", "UTC-9", "UTC-10", "UTC-11", "UTC-12").required(),
    meeting_type: Joi.string().valid("whatsapp_chat", "google_meet", "zoom_meet").required(),
    meeting_with: Joi.string().valid("owner_founder", "digital_marketer", "project_manager", "web_developer", "graphic_designer").required(),
    name: Joi.string().min(3).max(15).required(),
    email: Joi.string().email({ tlds: { allow: true } }).trim().min(8).max(50).lowercase().required(),
    phone: Joi.string().required(),
    country: Joi.string().min(2).required()
})

export const request_sample_schema = Joi.object({
    name: Joi.string().min(3).max(15).required(),
    email: Joi.string().email({ tlds: { allow: true } }).trim().min(8).max(50).lowercase().required(),
    phone: Joi.string().required(),
    country: Joi.string().min(2).required(),
    service_id: Joi.string().required(),
    requirements: Joi.string().required()
})

export const portfolio_schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    google_drive_link: Joi.string().optional()
})