import mongoose from "mongoose";



export interface IUser {
    _id?: mongoose.Types.ObjectId;
    id?: string;
    name: string;
    email: string;
    phone: number;
    password: string;
    dob?: string;
    image?: string;
    gender?: string;
    isBlocked: boolean;
    
  }

  export interface IOtp{
    _id?:mongoose.Types.ObjectId,
    otp:string,
    email:string,
    createdAt:Date,
    expiresAt:Date
  }

  export interface JwtPayload {
    email: string;
    name: string;
    iat: number;
    exp: number;
  }
  

  export interface IBooking {
    _id?: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
    trainerId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId |  { name: string; email: string }
    specialization?: string;
    sessionType: string;
    bookingDate: Date;
    startDate: Date;
    endDate: Date; 
    startTime: string;
    endTime: string;
    amount: number | undefined;
   paymentStatus: "Confirmed" | "Cancelled" | "Completed";
    createdAt: Date; 
  updatedAt: Date; 
  payment_intent?: string;

  }
