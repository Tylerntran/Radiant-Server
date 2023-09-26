import express from "express";
//get login from other login file
import { login } from "../controllers/authController.js";
import { linkLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);

router.post("/linkLogin", linkLogin);

export default router;
