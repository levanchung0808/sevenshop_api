import {
  // deleteAddress,
  deleteUser,
  getUserByID,
  getUsers,
  // insertAddress,
  // updateAddress,
  // updateUser,
} from 'controllers/user';
import { Router } from 'express';
import { validateAdmin, validateToken } from 'middleware/validate';

const router = Router();

// Auth routes
// router.post('/insertAddress', validateToken, insertAddress);
// router.post('/updateAddress/:id', validateToken, updateAddress);
// router.post('/deleteAddress/:id', validateToken, deleteAddress);
// router.put('/updateUser/:id', validateToken, updateUser);

router.get('/', validateToken, validateAdmin, getUsers);
router.get('/:id', validateToken, validateAdmin, getUserByID);
router.post('/deleteUser/:id', validateToken, validateAdmin, deleteUser);

export default router;
