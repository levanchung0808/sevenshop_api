import { Router } from "express";
import { validateAdmin } from "middleware/validate";

const router = Router();

const isAdmin = [validateAdmin];

// Size routes


export default router;
