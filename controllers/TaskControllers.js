import { Task } from "../models/TaskModel.js";

export const createTask = async (req, res) => {
    const { title, description, category, user } = req.body;

    if (!title || !category || !user) {
        return res.status(400).json({
            status: 'error',
            message: 'Please provide the required fields'
        });
    }

    try {
        const maxOrderTask = await Task.findOne({ category })
            .sort({ order: -1 })
            .limit(1);

        const newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0;

        const newTask = new Task({
            title,
            description,
            category,
            user,
            order: newOrder
        });

        const result = await newTask.save();

        return res.status(201).json({
            status: 'success',
            data: result,
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating task',
            error: error.message
        });
    }
}

export const getUserTasks = async (req, res) => {
    const { user } = req.params;

    try {
        const tasks = await Task.find({ user }).sort({ order: 1 });
        return res.status(200).json({
            status: 'success',
            data: tasks,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user tasks',
            error: error.message
        });
    }
}

export const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }

        // Get all tasks in the same category with higher order
        const tasksToUpdate = await Task.find({
            category: task.category,
            order: { $gt: task.order }
        });

        // Delete the task
        await Task.findByIdAndDelete(id);

        // Update order of remaining tasks
        for (const taskToUpdate of tasksToUpdate) {
            await Task.findByIdAndUpdate(taskToUpdate._id, {
                order: taskToUpdate.order - 1
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Task deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error deleting task',
            error: error.message
        });
    }
}

export const updateTask = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }

        // If category is changing, handle reordering
        if (updates.category && updates.category !== task.category) {
            // Get the highest order in the new category
            const maxOrderTask = await Task.findOne({ category: updates.category })
                .sort({ order: -1 })
                .limit(1);

            updates.order = maxOrderTask ? maxOrderTask.order + 1 : 0;

            // Update orders in the old category
            await Task.updateMany(
                {
                    category: task.category,
                    order: { $gt: task.order }
                },
                { $inc: { order: -1 } }
            );
        }

        const updatedTask = await Task.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            status: 'success',
            data: updatedTask
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error updating task',
            error: error.message
        });
    }
}

export const updateTaskOrder = async (req, res) => {
    const { id } = req.params;
    const { order: newOrder, category: newCategory } = req.body;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }

        const oldOrder = task.order;
        const oldCategory = task.category;

        if (newCategory === oldCategory) {
            if (newOrder > oldOrder) {
                // Moving down: decrease order of tasks between old and new position
                await Task.updateMany(
                    {
                        category: oldCategory,
                        order: { $gt: oldOrder, $lte: newOrder },
                        _id: { $ne: id }
                    },
                    { $inc: { order: -1 } }
                );
            } else if (newOrder < oldOrder) {
                // Moving up: increase order of tasks between new and old position
                await Task.updateMany(
                    {
                        category: oldCategory,
                        order: { $gte: newOrder, $lt: oldOrder },
                        _id: { $ne: id }
                    },
                    { $inc: { order: 1 } }
                );
            }
        }
        // If moving to a different category
        else {
            // Decrease order of tasks in old category
            await Task.updateMany(
                {
                    category: oldCategory,
                    order: { $gt: oldOrder }
                },
                { $inc: { order: -1 } }
            );

            // Increase order of tasks in new category
            await Task.updateMany(
                {
                    category: newCategory,
                    order: { $gte: newOrder }
                },
                { $inc: { order: 1 } }
            );
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { order: newOrder, category: newCategory },
            { new: true }
        );

        const allTasks = await Task.find({ user: task.user }).sort({ order: 1 });

        return res.status(200).json({
            status: 'success',
            data: allTasks
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error updating task order',
            error: error.message
        });
    }
}