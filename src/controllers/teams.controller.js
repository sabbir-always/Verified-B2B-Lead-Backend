import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { uploadCloudinary } from "../utils/upload.cloudinary.js";
import { teams_schema } from "../validations/joi.schema.validation.js";
import TeamsModel from "../models/teams.model.js";

export const create = async (req, res) => {
    try {
        const { first_name, last_name, phone, email, religion, blood_group, social } = req.body;
        const { error } = teams_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === exist phone ===
        const isExistedPhone = await TeamsModel.findOne({ phone: { $regex: new RegExp(`^${phone.trim()}$`, 'i') } })
        if (isExistedPhone) { return res.status(409).json({ success: false, message: "Phone already exists. try another." }) };

        // === exist email ===
        const isExistedEmail = await TeamsModel.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } })
        if (isExistedEmail) { return res.status(409).json({ success: false, message: "Email already exists. try another." }) };

        // Generate formatted date
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-GB") + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

        let attachment = req.body.attachment || null;
        if (req.file && req.file.path) {
            try {
                const files = await uploadCloudinary(req.file.path, 'Teams');
                if (files) { attachment = files }

            } catch (error) {
                console.error('File upload error:', error);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await TeamsModel.create({
            date_and_time_format: formattedDate,
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            phone: phone,
            email: email.toLowerCase(),
            religion: religion,
            blood_group: blood_group,
            social: social,
            attachment: attachment
        })

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Create Success',
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
        const dataFilter = { $or: [{ full_name: { $regex: searchQuery } }, { email: { $regex: searchQuery } }, { phone: { $regex: searchQuery } }] }

        // status filter
        if (status !== "") { dataFilter.isActive = status === "true" };

        const result = await TeamsModel.find(dataFilter).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean()
        const count = await TeamsModel.countDocuments(dataFilter);

        // Check not found
        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Users Show Success',
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
        const result = await TeamsModel.findById(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Teams Show Success',
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
        const { first_name, last_name, phone, email, religion, blood_group, social } = req.body;

        const { error } = teams_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === find items ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isTeams = await TeamsModel.findById(id);
        if (!isTeams) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        // === exist phone ===
        const isExistedPhone = await TeamsModel.findOne({ phone: { $regex: new RegExp(`^${phone.trim()}$`, "i") }, _id: { $ne: id } });
        if (isExistedPhone) { return res.status(400).json({ success: false, message: "Phone already exists. Try another." }) }

        // === exist email ===
        const isExistedEmail = await TeamsModel.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, "i") }, _id: { $ne: id } });
        if (isExistedEmail) { return res.status(400).json({ success: false, message: "Email already exists. Try another." }) }

        // Generate formatted date
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-GB") + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

        let attachment = isTeams.attachment;
        if (req.file && req.file.path) {
            try {
                const files = await uploadCloudinary(req.file.path, 'Teams');
                if (files) {
                    if (attachment && attachment.public_id) { await cloudinary.uploader.destroy(attachment.public_id) } // Delete old image if it exists
                    attachment = files;
                }
            } catch (error) {
                console.error('File upload error:', error);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await TeamsModel.findByIdAndUpdate(id, {
            date_and_time_format: formattedDate,
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            phone: phone,
            email: email.toLowerCase(),
            religion: religion,
            blood_group: blood_group,
            social: social,
            attachment: attachment
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Teams Update Success',
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

        // === find teams ===
        const isTeams = await TeamsModel.findById(id);
        if (!isTeams) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        const result = await TeamsModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {
            if (isTeams.attachment && isTeams.attachment.public_id) {
                await cloudinary.uploader.destroy(isTeams.attachment.public_id);
            }
            return res.status(200).json({
                success: true,
                message: 'Teams Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}