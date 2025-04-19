import { Request, Response, NextFunction } from 'express';
import Post from '../models/Post';
import AppError from '../utils/ApiError';
import { CreatePostInput, UpdatePostInput, UpdatePostParams, PostIdParam } from '../schemas/postSchema';
import mongoose from 'mongoose';

// Get all posts
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await Post.find().populate('author', 'username email'); // Populate author details
        res.status(200).json({
            status: 'success',
            results: posts.length,
            data: {
                posts,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single post by ID
export const getPostById = async (
    req: Request<PostIdParam>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
             return next(new AppError(`Invalid post ID format: ${id}`, 400));
         }

        const post = await Post.findById(id).populate('author', 'username email');

        if (!post) {
            return next(new AppError(`No post found with ID: ${id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                post,
            },
        });
    } catch (error) {
        next(error);
    }
};


// Create a new post (requires authentication)
export const createPost = async (
    req: Request<{}, {}, CreatePostInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?._id) {
             return next(new AppError('Authentication required. User ID not found.', 401));
         }

        const { title, content } = req.body;
        const authorId = req.user._id; // Get user ID from authenticated request

        const newPost = await Post.create({
            title,
            content,
            author: authorId,
        });

        // Optionally populate author details in the response
        await newPost.populate('author', 'username email');

        res.status(201).json({
            status: 'success',
            data: {
                post: newPost,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update a post (requires authentication and ownership)
export const updatePost = async (
    req: Request<UpdatePostParams, {}, UpdatePostInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return next(new AppError('Authentication required.', 401));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(`Invalid post ID format: ${id}`, 400));
        }

        const post = await Post.findById(id);

        if (!post) {
            return next(new AppError(`No post found with ID: ${id}`, 404));
        }

        // Authorization check: Ensure the logged-in user is the author
        if (post.author.toString() !== userId.toString()) {
            return next(new AppError('You do not have permission to perform this action', 403)); // Forbidden
        }

        // Update fields if provided
        if (title) post.title = title;
        if (content) post.content = content;

        // Only save if there are changes (Mongoose handles this internally too)
        if (post.isModified()) {
             await post.save();
        }


        // Populate author details in the response
        await post.populate('author', 'username email');

        res.status(200).json({
            status: 'success',
            data: {
                post,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a post (requires authentication and ownership)
export const deletePost = async (
    req: Request<PostIdParam>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return next(new AppError('Authentication required.', 401));
        }

         if (!mongoose.Types.ObjectId.isValid(id)) {
             return next(new AppError(`Invalid post ID format: ${id}`, 400));
         }


        const post = await Post.findById(id);

        if (!post) {
            return next(new AppError(`No post found with ID: ${id}`, 404));
        }

        // Authorization check: Ensure the logged-in user is the author
        if (post.author.toString() !== userId.toString()) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        await Post.findByIdAndDelete(id);

        res.status(204).json({ // 204 No Content is standard for successful deletion
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};