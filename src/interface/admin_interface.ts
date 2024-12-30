import mongoose from "mongoose";


export interface LoginAdmin_interface {
    _id?: mongoose.Types.ObjectId;
      id?: string;
    email: string;
    password: string;
    
  }
  
  export interface ISpecialization extends Document {
    name: string;
    description: string;
    image: string;
    createdAt: Date;
    isListed: boolean;

  }
