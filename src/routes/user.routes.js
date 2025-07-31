import express from "express";
import userValidationRules from "../validator/userValidator.js";
import { validationResult } from "express-validator";
import { registerUser } from "../controllers/User.controller.js";

const router = express.Router();

router.post("/register", userValidationRules, registerUser);

export default router;
