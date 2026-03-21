import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// export const uploadCloudinary = async (localFilePath, folderName = "images") => {
//     try {
//         if (!localFilePath) return null;
//         const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto', folder: folderName });
//         if (response) { fs.unlinkSync(localFilePath); } // Clean local file after successful upload
//         return response

//     } catch (error) {
//         console.error('Cloudinary upload failed:', error); // Remove the locally saved file in case of upload failure
//         if (fs.existsSync(localFilePath)) {
//             fs.unlinkSync(localFilePath);
//         }
//         return null;
//     }
// }

// ------------------------------ this is for vercel serverless -----------------------------------------
export const uploadCloudinary = async (file, folderName = "images") => {
    try {
        if (!file) return null;
        let localFilePath;

        if (file.buffer) {
            localFilePath = `/tmp/${file.originalname}`;
            fs.writeFileSync(localFilePath, file.buffer);
        } else {
            localFilePath = file.path;
        }
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto', folder: folderName });
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        if (file && (file.path || file.buffer)) {
            const cleanupPath = file.path || `/tmp/${file.originalname}`;
            if (fs.existsSync(cleanupPath)) fs.unlinkSync(cleanupPath);
        }
        return null;
    }
};

// --------------------------------------------------------------------------------------------------------