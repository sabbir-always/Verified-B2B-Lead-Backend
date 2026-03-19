import mongoose from "mongoose";
import { appointment_schema } from "../validations/joi.schema.validation.js";
import AppointmentModel from "../models/appointment.model.js";

export const create = async (req, res) => {
    try {
        const { select_day, select_month, select_time, select_time_hours, select_timezone, meeting_type, meeting_with, name, email, phone, country } = req.body;
        const { error } = appointment_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const isExistedSchedule = await AppointmentModel.findOne({
            select_day: select_day,
            select_month: select_month,
            select_time: select_time,
            select_time_hours: select_time_hours,
            select_timezone: select_timezone
        });

        if (isExistedSchedule) {
            return res.status(400).json({
                success: false,
                message: "This schedule is already booked"
            });
        }

        const result = await AppointmentModel.create({
            select_day: select_day,
            select_month: select_month,
            select_time: select_time,
            select_time_hours: select_time_hours,
            select_timezone: select_timezone,
            meeting_type: meeting_type,
            meeting_with: meeting_with,
            name: name,
            email: email.toLowerCase(),
            phone: phone,
            country: country
        });

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Appointment Create Success',
                payload: result
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const show = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const searchQuery = new RegExp('.*' + search + '.*', 'i');
        const { status = "" } = req.query;

        // Add search filter
        const dataFilter = { $or: [{ name: { $regex: searchQuery } }, { email: { $regex: searchQuery } }, { phone: { $regex: searchQuery } }] }

        // status filter
        const allowedStatus = ["pending", "approved", "timeout", "cancel"];
        if (status && status !== 'undefined' && status !== 'null' && status !== '' && allowedStatus.includes(status)) { dataFilter.status = status }

        const result = await AppointmentModel.find(dataFilter).limit(limit).skip((page - 1) * limit).lean()
        const count = await AppointmentModel.countDocuments(dataFilter);

        // Check not found
        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Appointment Show Success',
                pagination: {
                    per_page: limit,
                    current_page: page,
                    total_data: count,
                    total_page: Math.ceil(count / limit),
                    previous: page - 1 > 0 ? page - 1 : null,
                    next: page + 1 <= Math.ceil(count / limit) ? page + 1 : null
                },
                payload: result,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const single = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const result = await AppointmentModel.findById(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Appointment Show Success',
                payload: result
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const { select_day, select_month, select_time, select_time_hours, select_timezone, meeting_type, meeting_with, name, email, phone, country } = req.body;
        const { error } = appointment_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === find appointment ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isAppointment = await AppointmentModel.findById(id);
        if (!isAppointment) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        const isExistedSchedule = await AppointmentModel.findOne({
            select_day: select_day,
            select_month: select_month,
            select_time: select_time,
            select_time_hours: select_time_hours,
            select_timezone: select_timezone,
            _id: { $ne: id }
        });

        if (isExistedSchedule) {
            return res.status(400).json({
                success: false,
                message: "This schedule is already booked"
            });
        }

        const result = await AppointmentModel.findByIdAndUpdate(id, {
            select_day: select_day,
            select_month: select_month,
            select_time: select_time,
            select_time_hours: select_time_hours,
            select_timezone: select_timezone,
            meeting_type: meeting_type,
            meeting_with: meeting_with,
            name: name,
            email: email.toLowerCase(),
            phone: phone,
            country: country
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Appointment Update Success',
                payload: result
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }

        // === find reviews ===
        const isAppointment = await AppointmentModel.findById(id);
        if (!isAppointment) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        const result = await AppointmentModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });

        } else {
            return res.status(200).json({
                success: true,
                message: 'Appointment Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}
