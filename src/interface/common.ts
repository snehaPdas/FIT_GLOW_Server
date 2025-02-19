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
    height:string,
    weight:string
    
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
  dietPlan?: string,
  

  }

  export interface INotificationContent {
    content: string;
    bookingId: mongoose.Types.ObjectId;
    read: boolean;
    createdAt: Date;
  }
  
  export interface INotification {
    receiverId: mongoose.Types.ObjectId|string
    notifications: INotificationContent[];
  }
  export interface ITransaction {
    amount: number;             
    transactionId: string;      
    transactionType: 'credit' | 'debit';
    date?: Date;                
    bookingId?: string;         
}

export  interface IReview {
  userId: mongoose.Types.ObjectId
  trainerId: mongoose.Types.ObjectId
  rating: number
  comment: string
}