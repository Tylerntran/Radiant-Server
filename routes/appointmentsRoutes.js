import express from "express";
import {
  scheduleAppointment,
  noLoginAppointment,
  cancelAppointment,
  changeAppointment,
  getAllAppointments,
  getAppointmentsPage,
} from "../controllers/appointmentsController.js";
import { verifyToken } from "../middleware/authMIddleware.js";

const router = express.Router();

/* CREATE */
//WORKS
//TODO: Verify Token
router.post("/:userId/schedule", scheduleAppointment);
//pass in appointment id
router.post("/scheduleAppointment", noLoginAppointment);

router.get("/getAll", getAllAppointments);

router.get("/allAppointments", getAppointmentsPage);

/* UPDATE */
router.put("/:id/change", verifyToken, changeAppointment);

/* DELETE */
router.delete("/:id/delete", verifyToken, cancelAppointment);

export default router;
