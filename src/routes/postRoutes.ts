import express from 'express';
import * as postController from '../controllers/postController';
import { validate } from '../middleware/validationMiddleware';
import { createPostSchema, updatePostSchema, postIdParamSchema } from '../schemas/postSchema';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

console.log('Registering route:', 'sdfsd');
// Public routes for reading posts
router.get('/', postController.getAllPosts);
router.get('/:id', validate(postIdParamSchema), postController.getPostById); // Validate ID format

// Protected routes for creating, updating, deleting posts
router.use(authenticateToken); // Apply auth middleware to all subsequent routes in this file

router.post('/', validate(createPostSchema), postController.createPost);
router.patch('/:id', validate(updatePostSchema), postController.updatePost); // Use PATCH for partial updates
router.delete('/:id', validate(postIdParamSchema), postController.deletePost); // Validate ID format

export default router;