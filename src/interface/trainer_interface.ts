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