import mongoose from "mongoose";
import AuthModel from "../models/auth.model.js";
import ReviewsModel from "../models/review.model.js";
import ServicesModel from "../models/service.model.js";
import { reviews_schema } from "../validations/joi.schema.validation.js";

export const create = async (req, res) => {
    try {
        const { service_id, auth_id, rating, comment } = req.body;
        const { error } = reviews_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const isServices = await ServicesModel.findById(service_id);
        if (!isServices) { return res.json({ success: false, message: "service not found" }) }

        const isAuth = await AuthModel.findById(auth_id);
        if (!isAuth) { return res.json({ success: false, message: "users not found" }) }

        const isExistedReview = await ReviewsModel.findOne({ service_id, auth_id }); // users review same service in one time
        if (isExistedReview) { return res.status(409).json({ success: false, message: "You have already reviewed this service" }) }

        const result = await ReviewsModel.create({
            service_id: service_id,
            service_name: isServices.title || null,
            auth_id: auth_id,
            auth_name: isAuth.full_name || null,
            rating: rating,
            comment: comment
        })

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Review Create Success',
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

        const dataFilter = {}

        // status filter
        const allowedStatus = ["pending", "approved", "rejected"];
        if (status && status !== 'undefined' && status !== 'null' && status !== '' && allowedStatus.includes(status)) { dataFilter.status = status }

        const result = await ReviewsModel.find(dataFilter).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean()
        const count = await ReviewsModel.countDocuments(dataFilter);

        // Check not found
        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Reviews Show Success',
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
        const result = await ReviewsModel.findById(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Reviews Show Success',
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
        const { service_id, auth_id, rating, comment } = req.body;
        const { error } = reviews_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === find review ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isReviews = await ReviewsModel.findById(id);
        if (!isReviews) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        const isServices = await ServicesModel.findById(service_id);
        if (!isServices) { return res.json({ success: false, message: "service not found" }) }

        const isAuth = await AuthModel.findById(auth_id);
        if (!isAuth) { return res.json({ success: false, message: "users not found" }) }

        const isExistedReview = await ReviewsModel.findOne({ service_id, auth_id, _id: { $ne: id } }); // users review same service in one time
        if (isExistedReview) { return res.status(409).json({ success: false, message: "You have already reviewed this service" }) }

        const result = await ReviewsModel.findByIdAndUpdate(id, {
            service_id: service_id,
            service_name: isServices.title || null,
            auth_id: auth_id,
            auth_name: isAuth.full_name || null,
            rating: rating,
            comment: comment
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Reviews Update Success',
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
        const isReviews = await ReviewsModel.findById(id);
        if (!isReviews) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        const result = await ReviewsModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });

        } else {
            return res.status(200).json({
                success: true,
                message: 'Reviews Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const updateByStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // === find review ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isReviews = await ReviewsModel.findById(id);
        if (!isReviews) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        const validStatus = ["pending", "approved", "rejected"];
        if (!validStatus.includes(status)) { return res.status(400).json({ success: false, message: `Invalid status. Must be one of ${validStatus.join(", ")}` }) }

        const result = await ReviewsModel.findByIdAndUpdate(id, { status: status }, { new: true })

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Status Update Success',
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