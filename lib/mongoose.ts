import mongoose from 'mongoose';

let isConnected: boolean = false;


export const connectToDatabase = async () => {
    mongoose.set('strictQuery', true);
    if (!process.env.MONGODB_URL) {
        console.error("❌ MISSING MONGODB_URL in environment variables");
        throw new Error("Missing MONGODB_URL");
    }
    if (isConnected) {
        console.log("✅ MongoDB is already connected");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: "devflow",
        });
        isConnected = true;
        console.log("✅ Connected to MongoDB");
    } catch (error){
        console.error("❌ Error connecting to MongoDB:", error);
        throw error;
    }
}