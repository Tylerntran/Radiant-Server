import express from "express";
import { getUser, getAppointments } from "../controllers/usersController.js";
import { verifyToken } from "../middleware/authMIddleware.js";

const router = express.Router();

//read routes: only getting information from the database, not creating anything
/* READ */
//TODO: Verify token for both
router.get("/:id", verifyToken, getUser);
router.get("/:id/appointments", verifyToken, getAppointments);

export default router;
