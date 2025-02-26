import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log(`Connecting to MongoDB with URI: ${mongoUri}`);
        const conn = await mongoose.connect(mongoUri);
        console.log(`🌿 MongoDB Connected: ${conn.connection.host}`);
        const collections = await conn.connection.db.listCollections().toArray();
        console.log("Available collections:", collections.map(collection => collection.name));

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;