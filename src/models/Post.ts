import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User'; // Import User interface if needed for population type hints

export interface IPost extends Document {
    title: string;
    content: string;
    author: Types.ObjectId | IUser; // Can hold ObjectId or populated User object
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema({
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
}, { timestamps: true });

const Post: Model<IPost> = mongoose.model<IPost>('Post', PostSchema);

export default Post;