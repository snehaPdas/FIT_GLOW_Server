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
  
  export interface AdminLoginResponse {
    status: number;
    accessToken: string;
    refreshToken: string;
    success: boolean;
    message: string;


    admin: {
      id: string;
      name: string;
      email: string;
      password: string;  

    
    };
  }


  export interface MonthlyStats {
    users: number;        
    trainer: number;       
    revenue: number;      
    amount: number;     
    trainerRevenue: number; 
    adminRevenue: number;
  }
  
  
