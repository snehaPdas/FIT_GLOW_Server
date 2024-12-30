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
  