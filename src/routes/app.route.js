import express from "express";
import * as request_sample_controller from "../controllers/request_sample.controller.js";
import * as appointment_controller from "../controllers/appointment.controller.js";
import * as portfolio_controller from "../controllers/portfolio.controller.js";
import * as packages_controller from "../controllers/packages.controller.js";
import * as services_controller from "../controllers/service.controller.js";
import * as reviews_controller from "../controllers/review.controller.js";
import * as teams_controller from "../controllers/teams.controller.js";
import * as auth_controller from "../controllers/auth.controller.js";
import { isSignin } from "../middlewares/auth.middleware.js";
import upload from "../utils/upload.multer.js";
const router = express.Router();

// Public routes || http://localhost:8000/api/v1/auth/users/signup
router.post("/auth/users/signup", auth_controller.create)
router.post("/auth/users/signin", auth_controller.signin)
router.post("/auth/users/signout", auth_controller.signout)
router.get("/auth/users", auth_controller.show)
router.get("/auth/users/:id", auth_controller.single)
router.put("/auth/users/:id", auth_controller.update)
router.delete("/auth/users/:id", auth_controller.destroy)

// Privet routes || http://localhost:8000/api/v1/organization/teams
router.post("/organization/teams", upload.single("attachment"), teams_controller.create);
router.get("/organization/teams", teams_controller.show);
router.get("/organization/teams/:id", teams_controller.single);
router.put("/organization/teams/:id", upload.single("attachment"), teams_controller.update);
router.delete("/organization/teams/:id", teams_controller.destroy);

// Privet routes || http://localhost:8000/api/v1/organization/services
router.post("/organization/services", upload.single("attachment"), services_controller.create);
router.get("/organization/services", services_controller.show);
router.get("/organization/services/:id", services_controller.single);
router.put("/organization/services/:id", upload.single("attachment"), services_controller.update);
router.delete("/organization/services/:id", services_controller.destroy);

// Privet routes || http://localhost:8000/api/v1/organization/service/packages
router.post("/organization/service/packages", packages_controller.create);
router.get("/organization/service/packages", packages_controller.show);
router.get("/organization/service/packages/:id", packages_controller.single);
router.put("/organization/service/packages/:id", packages_controller.update);
router.delete("/organization/service/packages/:id", packages_controller.destroy);

// Privet routes || http://localhost:8000/api/v1/organization/service/reviews
router.post("/organization/service/reviews", reviews_controller.create);
router.get("/organization/service/reviews", reviews_controller.show);
router.get("/organization/service/reviews/:id", reviews_controller.single);
router.put("/organization/service/reviews/:id", reviews_controller.update);
router.delete("/organization/service/reviews/:id", reviews_controller.destroy);
router.patch("/organization/service/reviews/status/:id", reviews_controller.updateByStatus);

// Privet routes || http://localhost:8000/api/v1/organization/appointment
router.post("/organization/appointment", appointment_controller.create);
router.get("/organization/appointment", appointment_controller.show);
router.get("/organization/appointment/:id", appointment_controller.single);
router.put("/organization/appointment/:id", appointment_controller.update);
router.delete("/organization/appointment/:id", appointment_controller.destroy);

// Privet routes || http://localhost:8000/api/v1/organization/service/requestsample
router.post("/organization/service/requestsample", request_sample_controller.create);
router.get("/organization/service/requestsample", request_sample_controller.show);
router.get("/organization/service/requestsample/:id", request_sample_controller.single);
router.put("/organization/service/requestsample/:id", request_sample_controller.update);
router.delete("/organization/service/requestsample/:id", request_sample_controller.destroy);
router.patch("/organization/service/requestsample/status/:id", request_sample_controller.updateByStatus);

// Privet routes || http://localhost:8000/api/v1/organization/portfolio
router.post("/organization/portfolio", portfolio_controller.create);
router.get("/organization/portfolio", portfolio_controller.show);
router.get("/organization/portfolio/:id", portfolio_controller.single);
router.put("/organization/portfolio/:id", portfolio_controller.update);
router.delete("/organization/portfolio/:id", portfolio_controller.destroy);

export default router;