import express from "express";
import {
  overview,
  topServices,
  availability,
} from "../controllers/statsController.js";

const router = express.Router();

router.get("/topServices", topServices);
router.get("/overview", overview);
router.get("/times", availability);

export default router;
