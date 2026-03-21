import multer from "multer"
import fs from 'fs'; //default in nodejs
import path from 'path'; //default in nodejs
import { fileURLToPath } from 'url'; //default in nodejs

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create file upload directory
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// sotre config
// const storage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, UPLOADS_DIR)
//     },
//     filename: function (req, file, callback) {
//         const filename = `image-${Date.now()}.${file.originalname}`
//         callback(null, filename)
//     }
// })

// --------------------- this is for vercel serverless -----------------------------
const storage = process.env.SERVERLESS_FOR_VERCEL === "false" ? multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `image-${Date.now()}-${file.originalname}`)
}) : multer.memoryStorage();
// ---------------------------------------------------------------------------------

// file type filter
const fileFilter = (req, file, callback) => {
    if (["image/png", "image/jpg", "image/jpeg", "image/gif"].includes(file.mimetype)) {
        callback(null, true);
    } else {
        return callback(new Error("Only JPG, JPEG, PNG, GIF files are allowed"), false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
})

export default upload