import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { errorHandler, ErrorResponse } from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import shoppingListRoutes from './routes/shoppingListRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Initialize express app
const app = express();

// Security Middlewares
app.use(helmet());

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://recipeai-frontend.vercel.app' // Example production URL
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new ErrorResponse('Not allowed by CORS', 403));
    },
    credentials: true,
  })
);

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Cookie parser middleware to extract JWT from HTTP-only cookies
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to API routes
app.use('/api/', apiLimiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/shoppinglists', shoppingListRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// API Health Check Route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({
    success: true,
    message: 'RecipeAI Server is running smoothly',
    timestamp: new Date(),
    services: {
      database: dbStatus,
      uptime: process.uptime()
    }
  });
});

// Serve static assets from uploads directory (will be used in Step 3)
app.use('/uploads', express.static('uploads'));

// Unmatched API Routes (404 Handler)
app.use('*', (req, res, next) => {
  next(new ErrorResponse(`Route ${req.originalUrl} not found on this server`, 404));
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

export default app;
