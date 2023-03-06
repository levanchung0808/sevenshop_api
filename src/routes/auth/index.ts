import {
  changePassword,
  checkOTP,
  forgotPassword,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  setPassword,
} from 'controllers/auth';
import { Router } from 'express';
import { validateToken } from 'middleware/validate';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/check_otp', checkOTP);
router.post('/forgot_password', forgotPassword);
router.post('/set_password', validateToken, setPassword);
router.get('/logout', validateToken, logout);
router.post('/refresh_token', refreshToken);
router.get('/me', validateToken, getMe);
router.post('/change_password', validateToken, changePassword);

export default router;
