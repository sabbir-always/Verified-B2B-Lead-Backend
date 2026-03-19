import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import chalk from "chalk";
import cors from "cors";
import { databaseConnect } from "./src/config/database.config.js";
import router from "./src/routes/app.route.js";

// Initialize environment variables
dotenv.config();
const PORT = process.env.SERVER_PORT || 5000;

// Body Parser
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan("dev"));

// Allowed origins (local + production)
const allowedOrigins = ["http://localhost:5173", "https://polytechnic-private-home.vercel.app"];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// MongoDB Connection
await databaseConnect()
app.use("/api/v1", router);
app.get("/", (req, res) => { res.send("Server Running Success!") })

app.use((err, req, res, next) => {
    console.error(chalk.bgRed.white.bold(err.message));
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

if (process.env.SERVERLESS_FOR_VERCEL !== "true") {
    app.listen(PORT, () => {
        console.log(chalk.bgWhite.bold(`Local Server is running at http://localhost:${PORT}`))
    })
}

export default app;