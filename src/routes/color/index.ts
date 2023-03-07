import { Router } from "express";
import { validateAdmin } from "middleware/validate";
import { createColor, deleteColor, getColors, updateColor } from "controllers/color";

const router = Router();

const isAdmin = [validateAdmin];

// Color routes
router.get("/", getColors);
router.post("/", isAdmin, createColor);
router.put("/:id", isAdmin, updateColor);
router.delete("/:id", isAdmin, deleteColor);

export default router;
