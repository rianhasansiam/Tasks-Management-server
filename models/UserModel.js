import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    displayName: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true, // This creates an index automatically
        lowercase: true
    },
    photoURL: {
        type: String,
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

// Remove the duplicate manual index
// userSchema.index({ email: 1 }); -- this is not needed anymore

export const User = mongoose.model('User', userSchema);
