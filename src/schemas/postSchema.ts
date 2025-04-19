import { z } from 'zod';

export const createPostSchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Title is required' })
                  .min(1, 'Title cannot be empty')
                  .trim(),
        content: z.string({ required_error: 'Content is required' })
                    .min(1, 'Content cannot be empty')
                    .trim(),
    }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];

export const updatePostSchema = z.object({
    body: z.object({
        title: z.string()
                  .min(1, 'Title cannot be empty')
                  .trim()
                  .optional(),
        content: z.string()
                    .min(1, 'Content cannot be empty')
                    .trim()
                    .optional(),
    }),
    params: z.object({
        id: z.string({ required_error: 'Post ID is required in params' }),
    }),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
export type UpdatePostParams = z.infer<typeof updatePostSchema>['params'];


export const postIdParamSchema = z.object({
    params: z.object({
        id: z.string({ required_error: 'Post ID is required in params' }),
    }),
});
export type PostIdParam = z.infer<typeof postIdParamSchema>['params'];