import mongoose from "mongoose";
import PackagesModel from "../models/packages.model.js";
import ServicesModel from "../models/service.model.js";
import { packages_schema } from "../validations/joi.schema.validation.js";

export const create = async (req, res) => {
    try {
        const { service_id, package_name, price, features, status } = req.body;
        const { error } = packages_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === exist packages ===
        const isExistedName = await PackagesModel.findOne({ package_name: { $regex: new RegExp(`^${package_name.trim()}$`, "i") } })
        if (isExistedName) { return res.status(409).json({ success: false, message: "Package name already exists. try another." }) };

        const isServices = await ServicesModel.findById(service_id);
        if (!isServices) { return res.json({ success: false, message: "service not found" }) }

        const result = await PackagesModel.create({
            service_id: service_id,
            service_name: isServices.title || null,
            package_name: package_name,
            price: price,
            features: features,
            status: status
        })

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Packages Create Success',
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
        const dataFilter = { $or: [{ package_name: { $regex: searchQuery } }] }

        // status filter
        const allowedStatus = ["active", "inactive"];
        if (status && status !== 'undefined' && status !== 'null' && status !== '' && allowedStatus.includes(status)) { dataFilter.status = status }

        const result = await PackagesModel.find(dataFilter).limit(limit).skip((page - 1) * limit).lean()
        const count = await PackagesModel.countDocuments(dataFilter);

        // Check not found
        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Packages Show Success',
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
        const result = await PackagesModel.findById(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Packages Show Success',
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
        const { service_id, package_name, price, features, status } = req.body;
        const { error } = packages_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === find package ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isPackages = await PackagesModel.findById(id);
        if (!isPackages) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        // === exist package ===
        const isExistedName = await PackagesModel.findOne({ package_name: { $regex: new RegExp(`^${package_name.trim()}$`, "i") }, _id: { $ne: id } });
        if (isExistedName) { return res.status(400).json({ success: false, message: "Package name already exists. Try another." }) }

        const isServices = await ServicesModel.findById(service_id);
        if (!isServices) { return res.json({ success: false, message: "service not found" }) }

        const result = await PackagesModel.findByIdAndUpdate(id, {
            service_id: service_id,
            service_name: isServices.title || null,
            package_name: package_name,
            price: price,
            features: features,
            status: status
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Packages Update Success',
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

        // === find packages ===
        const isPackages = await PackagesModel.findById(id);
        if (!isPackages) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        const result = await PackagesModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });

        } else {
            return res.status(200).json({
                success: true,
                message: 'Packages Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}