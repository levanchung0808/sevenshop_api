import { validateAdmin, validateToken } from 'middleware/validate';
import { Router } from 'express';
import {
  getAll,
  getOrdersByUserID,
  addToCart,
  removeFromCart,
  clearCart,
} from 'controllers/order';

const router = Router();

router.get('/', validateAdmin, getAll);
router.get('/getOrderByUserID', validateToken, getOrdersByUserID);
router.post('/addToCart', validateToken, addToCart);
router.post('/removeFromCart', validateToken, removeFromCart);
router.post('/clearCart', validateToken, clearCart);

export default router;
