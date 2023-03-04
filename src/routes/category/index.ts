import { Router } from "express";
import {
  createCategory,
  getCategoryById,
  getCategories,
  updateCategory,
  deleteCategory,
} from "controllers/category";
import { validateAdmin } from "middleware/validate";

const router = Router();

const isAdmin = [validateAdmin];

//Category routes
router.get("/categories", getCategories);
router.get("/category/:id", getCategoryById);
router.post("/category", isAdmin, createCategory);
router.put("/category/:id", isAdmin, updateCategory);
router.delete("/category/:id", isAdmin, deleteCategory);

export default router;
