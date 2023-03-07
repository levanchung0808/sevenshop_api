import { Router } from 'express';
import {
  createCategory,
  getCategoryById,
  getCategories,
  updateCategory,
  deleteCategory,
} from 'controllers/category';
import { validateAdmin } from 'middleware/validate';

const router = Router();

const isAdmin = [validateAdmin];

// Category routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', isAdmin, createCategory);
router.put('/:id', isAdmin, updateCategory);
router.delete('/:id', isAdmin, deleteCategory);

export default router;
