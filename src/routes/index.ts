import express from 'express';
import authRoutes from './authRoutes';
import postRoutes from './postRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);

// Optional: Root health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});


export default router;