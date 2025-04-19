import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors
import { globalErrorHandler } from './middleware/errorMiddleware';
import routes from './routes/index'; // Import combined routes
import cookieParser from 'cookie-parser';

dotenv.config();

const app: Application = express();

// --- Middlewares ---

// Enable CORS - configure origins as needed for security
app.use(cors({
  origin: '*', // Allow all origins for now, restrict in production!
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(cookieParser());
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // For form data

// --- Routes ---
app.get('/', (req: Request, res: Response) => { // Basic root route
  res.send('Blog API is running!');
});

app.use('/api/v1', routes); // Mount all routes under /api/v1



// --- Global Error Handling Middleware ---
// Must be the LAST middleware
app.use((globalErrorHandler as (err: Error, req: Request, res: Response, next: NextFunction) => void));

export default app;