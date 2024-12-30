import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()


const connectDB=async()=>{
    const uri=process.env.MONGO_URI || ""
    console.log("Mongo URI:", uri); 

    try {
        await mongoose.connect(uri)
        console.log('MongoDB connected successfully');

    } catch (error) {
        console.log('MongoDB connection error', error)
        process.exit(1);

    }
}

export  default connectDB