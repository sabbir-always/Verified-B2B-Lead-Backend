import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { uploadCloudinary } from "../utils/upload.cloudinary.js";
import { portfolio_schema } from "../validations/joi.schema.validation.js";
import PortfolioModel from "../models/portfolio.model.js";
import slugify from "slugify";

export const create = async (req, res) => {
    try {
        const { title, slug, google_drive_link, description } = req.body;
        const { error } = portfolio_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === exist title ===
        const isExistedTitle = await PortfolioModel.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } })
        if (isExistedTitle) { return res.status(409).json({ success: false, message: "Title already exists. try another." }) };

        let attachment = req.body.attachment || null;
        if (req.file && req.file.path) {
            try {
                const files = await uploadCloudinary(req.file.path, 'Portfolio');
                if (files) { attachment = files }

            } catch (error) {
                console.error('File upload error:', error);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await TeamsModel.create({
            title: title,
            slug: slugify(title, { lower: true, strict: true }),
            google_drive_link: google_drive_link,
            description: description,
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
        const dataFilter = { $or: [{ title: { $regex: searchQuery } }] }

        // status filter
        if (status !== "") { dataFilter.isActive = status === "true" };

        const result = await PortfolioModel.find(dataFilter).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean()
        const count = await PortfolioModel.countDocuments(dataFilter);

        // Check not found
        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Portfolio Show Success',
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
        const result = await PortfolioModel.findById(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Portfolio Show Success',
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
        const { title, slug, google_drive_link, description, isActive } = req.body;
        const { error } = portfolio_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === find items ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isPortfolio = await PortfolioModel.findById(id);
        if (!isPortfolio) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        // === exist title ===
        const isExistedTitle = await PortfolioModel.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, "i") }, _id: { $ne: id } });
        if (isExistedTitle) { return res.status(400).json({ success: false, message: "Title already exists. Try another." }) }

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
            title: title,
            slug: slugify(title, { lower: true, strict: true }),
            google_drive_link: google_drive_link,
            description: description,
            isActive: isActive,
            attachment: attachment
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Portfolio Update Success',
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
        const isPortfolio = await PortfolioModel.findById(id);
        if (!isPortfolio) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        const result = await PortfolioModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {
            if (isPortfolio.attachment && isPortfolio.attachment.public_id) {
                await cloudinary.uploader.destroy(isPortfolio.attachment.public_id);
            }
            return res.status(200).json({
                success: true,
                message: 'Portfolio Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}