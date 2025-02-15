    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    import mongoose, { Types } from "mongoose";

    export interface Interface_Trainer{
        length?: number;
        filter(arg0: (trainer: { isBlocked: boolean; kycStatus: string; }) => boolean): unknown;
        _id?: Types.ObjectId;
        id?: string; 
        name?: string;
        phone?: number;
        email?: string;
        password?: string;
        isBlocked?: boolean;
        specializations?: Types.ObjectId[];
        kycStatus?:string,
        profileImage?:string


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
  _id: number;
  save(): unknown;
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
export interface ITrainerKYC extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  kycData: IKYC; // Embedded KYC data
}


export interface MonthlyStats {
  trainer: any;
  trainerRevenue: any;
  users: number;               
  revenue: number;      
  amount: number;     
}