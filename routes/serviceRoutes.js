import express from "express";
import {
  getService,
  newService,
  getAllServices,
} from "../controllers/serviceController.js";
import { verifyToken } from "../middleware/authMIddleware.js";

const router = express.Router();

//read routes: only getting information from the database, not creating anything
/* READ */
//TODO: Verify token for both
router.post("/newService", newService);
router.get("/:id/getService", getService);
router.get("/getServices", getAllServices);

export default router;
