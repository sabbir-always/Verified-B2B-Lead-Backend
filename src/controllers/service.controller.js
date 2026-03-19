import { service_schema } from "../validations/joi.schema.validation.js";
import { uploadCloudinary } from "../utils/upload.cloudinary.js";
import PackagesModel from "../models/packages.model.js";
import ServicesModel from "../models/service.model.js";
import ReviewsModel from "../models/review.model.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";
import slugify from "slugify";

export const create = async (req, res) => {
    try {
        const { title, slug, description, features, status } = req.body;
        const { error } = service_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === exist title ===
        const isExistedTitle = await ServicesModel.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } })
        if (isExistedTitle) { return res.status(409).json({ success: false, message: "Title already exists. try another." }) };

        let attachment = req.body.attachment || null;
        if (req.file && req.file.path) {
            try {
                const files = await uploadCloudinary(req.file.path, 'Services');
                if (files) { attachment = files }

            } catch (error) {
                console.error('File upload error:', error);
                return res.status(500).json({ success: false, message: 'Error processing file upload' });
            }
        }

        const result = await ServicesModel.create({
            title: title,
            slug: slugify(title, { lower: true, strict: true }),
            description: description,
            features: features,
            status: status,
            attachment: attachment
        })

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Service Create Success',
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
        const allowedStatus = ["active", "inactive"];
        if (status && status !== 'undefined' && status !== 'null' && status !== '' && allowedStatus.includes(status)) { dataFilter.status = status }

        const result = await ServicesModel.find(dataFilter).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean()
        const count = await ServicesModel.countDocuments(dataFilter);

        // Check not found
        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Services Show Success',
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
        const result = await ServicesModel.findById(id);
        const packages = await PackagesModel.find({ service_id: id }).lean();
        const reviews = await ReviewsModel.find({ service_id: id, status: "approved" }).sort({ createdAt: -1 }).lean();
        const avgRatings = reviews.length > 0 ? parseFloat((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)) : 0;

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Services Show Success',
                payload: {
                    ...result._doc,
                    packages: packages,
                    reviews: reviews,
                    average_rating: avgRatings
                }
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
        const { title, slug, description, features, status } = req.body;

        const { error } = service_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === find items ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isServices = await ServicesModel.findById(id);
        if (!isServices) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        // === exist title ===
        const isExistedTitle = await ServicesModel.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, "i") }, _id: { $ne: id } });
        if (isExistedTitle) { return res.status(400).json({ success: false, message: "Title already exists. Try another." }) }

        let attachment = isServices.attachment;
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

        const result = await ServicesModel.findByIdAndUpdate(id, {
            title: title,
            slug: slugify(title, { lower: true, strict: true }),
            description: description,
            features: features,
            status: status,
            attachment: attachment
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Service Update Success',
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

        // === find items ===
        const isServices = await ServicesModel.findById(id);
        if (!isServices) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        const result = await ServicesModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {
            await PackagesModel.deleteMany({ service_id: id }); // === delete all package history ===
            await ReviewsModel.deleteMany({ service_id: id }); // === delete all review history ===
            if (isServices.attachment && isServices.attachment.public_id) {
                await cloudinary.uploader.destroy(isServices.attachment.public_id);
            }
            return res.status(200).json({
                success: true,
                message: 'Service Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}