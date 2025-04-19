import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface defining the structure of a User document (including virtuals/methods if needed)
export interface IUser extends Document {
    username: string;
    email: string;
    password?: string; // Make optional for safety when returning user data
    createdAt: Date;
    updatedAt: Date;
    // Method to compare passwords
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Mongoose Schema
const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: 3,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false, // Automatically exclude password field by default
    },
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err: any) {
        next(err); // Pass error to error handler
    }
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    // 'this.password' won't be available here directly due to `select: false`
    // We need to explicitly query for it when needed, or fetch the user with the password field
    const user = await mongoose.model<IUser>('User').findById(this._id).select('+password');
    if (!user || !user.password) return false;
    return bcrypt.compare(candidatePassword, user.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;