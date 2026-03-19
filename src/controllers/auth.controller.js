import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import AuthModel from "../models/auth.model.js";
import { auth_create_schema, auth_signin_schema, auth_update_schema } from "../validations/joi.schema.validation.js";
import createJSONWebToken from "../validations/token.validation.js";
import dotenv from 'dotenv';
dotenv.config();

export const create = async (req, res) => {
    try {
        const { first_name, last_name, user_name, phone, email, password } = req.body;
        const { error } = auth_create_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === exist user name ===
        const isExistedUser = await AuthModel.findOne({ user_name: { $regex: new RegExp(`^${user_name.trim()}$`, "i") } })
        if (isExistedUser) { return res.status(409).json({ success: false, message: "User name already exists. try another." }) };

        // === exist phone ===
        const isExistedPhone = await AuthModel.findOne({ phone: { $regex: new RegExp(`^${phone.trim()}$`, 'i') } })
        if (isExistedPhone) { return res.status(409).json({ success: false, message: "Phone already exists. try another." }) };

        // === exist email ===
        const isExistedEmail = await AuthModel.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } })
        if (isExistedEmail) { return res.status(409).json({ success: false, message: "Email already exists. try another." }) };

        // Generate formatted date
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-GB") + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

        const result = await AuthModel.create({
            date_and_time_format: formattedDate,
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            user_name: user_name,
            phone: phone,
            email: email.toLowerCase(),
            password: password
        })

        if (result) {
            return res.status(201).json({
                success: true,
                message: 'Users Register Success',
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
        const { from_date = "", to_date = "", role = "", status = "" } = req.query;

        // Add search filter
        const dataFilter = { $or: [{ full_name: { $regex: searchQuery } }, { user_name: { $regex: searchQuery } }, { email: { $regex: searchQuery } }, { phone: { $regex: searchQuery } }] }

        // role and status filter
        if (role && ["user", "admin"].includes(role)) { dataFilter.role = role };
        if (status !== "") { dataFilter.isActive = status === "true" };

        // Date and time filter
        if (from_date || to_date) {
            dataFilter.date_and_time = {};

            if (from_date) {
                const fromDate = new Date(from_date);
                dataFilter.date_and_time.$gte = fromDate;
            }

            if (to_date) {
                const toDate = new Date(to_date);
                dataFilter.date_and_time.$lte = toDate;
            }
        }

        // Hide specific fields
        const options = { first_name: 0, last_name: 0 };
        const result = await AuthModel.find(dataFilter, options).select("-password -__v").sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).lean()
        const count = await AuthModel.countDocuments(dataFilter);

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

        const result = await AuthModel.findById(id).select("-password -__v");
        if (!result) {
            return res.status(200).json({ success: false, message: "No Data Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Users Show Success',
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
        const { first_name, last_name, user_name, phone, email } = req.body;

        // === Basic field validation ===
        const { error } = auth_update_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === find items ===
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ success: false, message: "Invalid ID Format" }) }
        const isUsers = await AuthModel.findById(id);
        if (!isUsers) { return res.status(404).json({ success: false, message: "Not Found By ID" }) }

        // === exist username ===
        const isExistedUser = await AuthModel.findOne({ user_name: { $regex: new RegExp(`^${user_name.trim()}$`, "i") }, _id: { $ne: id } });
        if (isExistedUser) { return res.status(400).json({ success: false, message: "User name already exists. Try another." }) }

        // === exist phone ===
        const isExistedPhone = await AuthModel.findOne({ phone: { $regex: new RegExp(`^${phone.trim()}$`, "i") }, _id: { $ne: id } });
        if (isExistedPhone) { return res.status(400).json({ success: false, message: "Phone already exists. Try another." }) }

        // === exist email ===
        const isExistedEmail = await AuthModel.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, "i") }, _id: { $ne: id } });
        if (isExistedEmail) { return res.status(400).json({ success: false, message: "Email already exists. Try another." }) }

        // Generate formatted date
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-GB") + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

        const result = await AuthModel.findByIdAndUpdate(id, {
            date_and_time_format: formattedDate,
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            user_name: user_name,
            phone: phone,
            email: email.toLowerCase(),
        }, { new: true })

        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Users Update Success',
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
        const isUsers = await AuthModel.findById(id);
        if (!isUsers) { return res.status(404).json({ success: false, message: "Item Not Found" }) }

        const result = await AuthModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(200).json({ success: false, message: "Data Not Found" });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Users Destroy Success',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const signin = async (req, res) => {
    try {
        const { users, password } = req.body
        const { error } = auth_signin_schema.validate(req.body, { errors: { wrap: { label: "" } } });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }) }

        // === exist users ===
        const isExistedUsers = await AuthModel.findOne({ $or: [{ user_name: { $regex: new RegExp(`^${users.trim()}$`, "i") } }, { email: { $regex: new RegExp(`^${users.trim()}$`, "i") } }, { phone: { $regex: new RegExp(`^${users.trim()}$`, "i") } }] });
        if (!isExistedUsers) { return res.status(401).json({ success: false, message: "Invalid credentials. Try again." }) }

        // === check if user is active ===
        if (!isExistedUsers.isActive) {
            return res.status(403).json({ success: false, message: "Your account is deactivated. Please contact support." });
        }

        // === password check ===
        const isMatchPassword = await bcrypt.compare(password, isExistedUsers.password);
        if (!isMatchPassword) { return res.status(401).json({ success: false, message: "Invalid credentials. Try again." }) }

        // === create token ===
        const createToken = createJSONWebToken({ _id: isExistedUsers._id }, process.env.JWT_SECRET_KEY, "5m");
        return res.status(200).json({ success: true, message: "Login successful", token: createToken });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}

export const signout = async (req, res) => {
    try {


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}