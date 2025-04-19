import express from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validationMiddleware';
import { registerUserSchema, loginUserSchema } from '../schemas/userSchema';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

console.log('Registering route:', 'sdfsd');
// Public routes
router.post('/register', validate(registerUserSchema), authController.register);
router.post('/login', validate(loginUserSchema), authController.login);

// Protected routes (Example: Get user profile)
router.get('/me', authenticateToken, authController.getMe);

export default router;