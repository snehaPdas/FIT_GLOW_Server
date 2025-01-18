    import mongoose, { Types } from "mongoose";

    export interface Interface_Trainer{
        _id?: Types.ObjectId;
        id?: string; 
        name: string;
        phone: number;
        email: string;
        password: string;
        isBlocked?: boolean;
        specializations?: Types.ObjectId[];
        kycStatus:String,
        profileImage:String


    }

    import { Document } from 'mongoose';

  export interface IKYC extends Document {
    trainerId: Types.ObjectId;
    specializationId: Types.ObjectId[];
    profileImage: string,
    certificate: string
    aadhaarFrontImage: string,
    aadhaarBackImage: string,
    kycStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason: string
    kycSubmissionDate: Date;
    kycComments: string;
  }

  
export interface ISession {
  trainerId: Types.ObjectId;
  specializationId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  // isSingleSession: boolean;
  type:string
  SessionType:string
  numberOfSessions: number;
  price: number | undefined
  isBooked: boolean,
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'InProgress';
  paymentIntentId?: string; 
}

export interface ISpecialization {
  _id: Types.ObjectId;
  name: string;
}

export interface ISessionDetails {
  trainerId: string;
  price: number;
}
