import mongoose, { Schema } from 'mongoose';


const TaskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [50, 'Title must be less than 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description must be less than 200 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['To-Do', 'In-Progress', 'Done'],
        default: 'To-Do'
    },
    order: {
        type: Number,
        default: 0
    },
    user: {
        type: String,
        ref: 'User',
        required: [true, 'User is required']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

TaskSchema.index({ user: 1, category: 1 });
TaskSchema.index({ timestamp: 1 });

export const Task = mongoose.model('Task', TaskSchema);