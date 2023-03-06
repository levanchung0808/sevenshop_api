import { validateAdmin } from 'middleware/validate';
import { Router } from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  generateStock,
} from 'controllers/product';

const router = Router();
const isAdmin = [validateAdmin];

router.get('/', getProducts);
router.get("/:id", getProductById);
router.post('/', isAdmin, createProduct);
router.get('/generateStock', isAdmin, generateStock);
router.put('/update/:id', isAdmin, updateProduct);
router.delete('/delete/:id', isAdmin, deleteProduct);

export default router;
