import RequestSampleModel from "../models/request_sample.model.js";
import ServicesModel from "../models/service.model.js";
import { request_sample_schema } from "../validations/joi.schema.validation.js";

export const create = async (req, res) => {
    try {
        const { name, email, phone, country, service_id, requirements } = req.body;
        const { error } = request_sample_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        const isServices = await ServicesModel.findById(service_id);
        if (!isServices) { return res.json({ success: false, message: "service not found" }) }

        const isExistedRequest = await RequestSampleModel.findOne({ service_id, email, phone, status: "pending" });
        if (isExistedRequest) { return res.status(409).json({ success: false, message: "You already have a pending request for this service" }) }

        const result = await RequestSampleModel.create({
            name: name,
            email: email,
            phone: phone,
            country: country,
            service_id: service_id,
            service_name: isServices.title || null,
            requirements: requirements,
        })

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Request Send Success',
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
        const allowedStatus = ["pending", "approved", "rejected"];
        if (status && status !== 'undefined' && status !== 'null' && status !== '' && allowedStatus.includes(status)) { dataFilter.status = status }

        const result = await RequestSampleModel.find(dataFilter).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean()
        const count = await RequestSampleModel.countDocuments(dataFilter);

        // Check not found
        if (result.length === 0) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Request Sample Show Success',
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
        const result = await RequestSampleModel.findById(id);

        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Request Sample Show Success',
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
        const { name, email, phone, country, service_id, requirements } = req.body;
        const { error } = request_sample_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === find request sample ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isRequestSample = await RequestSampleModel.findById(id);
        if (!isRequestSample) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        const isServices = await ServicesModel.findById(service_id);
        if (!isServices) { return res.json({ success: false, message: "service not found" }) }

        const isExistedRequest = await RequestSampleModel.findOne({ service_id, email, phone, status: "pending", _id: { $ne: id } });
        if (isExistedRequest) { return res.status(409).json({ success: false, message: "You already have a pending request for this service" }) }

        const result = await RequestSampleModel.findByIdAndUpdate(id, {
            name: name,
            email: email,
            phone: phone,
            country: country,
            service_id: service_id,
            service_name: isServices.title || null,
            requirements: requirements
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Request Sample Update Success',
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

        // === find request sample ===
        const isRequestSample = await RequestSampleModel.findById(id);
        if (!isRequestSample) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        const result = await RequestSampleModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });

        } else {
            return res.status(200).json({
                success: true,
                message: 'Request Sample Destroy Success',
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
        const isRequestSample = await RequestSampleModel.findById(id);
        if (!isRequestSample) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        const validStatus = ["pending", "approved", "rejected"];
        if (!validStatus.includes(status)) { return res.status(400).json({ success: false, message: `Invalid status. Must be one of ${validStatus.join(", ")}` }) }

        const result = await RequestSampleModel.findByIdAndUpdate(id, { status: status }, { new: true })

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