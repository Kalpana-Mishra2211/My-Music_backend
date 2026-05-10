import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connection success!");

    }
    catch (err) {
        console.log("MongoDB connection failed!", err.message);
    }
}

export default connectDB