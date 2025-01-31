import { IBooking, IOtp, IUser } from "../interface/common";
import UserModel from "../models/userModel";
import OtpModel from "../models/otpModel";
import mongoose from "mongoose";
import { User } from "../interface/user_interface";
import TrainerModel from "../models/trainerModel";
import SessionModel from "../models/sessionModel";
import { ISpecialization } from "../interface/trainer_interface";
import BookingModel from "../models/bookingModel";
import SpecializationModel from "../models/specializationModel";
import { IUserRepository } from "../interface/user/User.repository.interface";

class UserRepository implements IUserRepository  {
  deleteOtpByEmail(useremail: string) {
    throw new Error("Method not implemented.");
  }
  private userModel = UserModel;
  private otpModel = OtpModel;
  private trainerModel=TrainerModel
  private sessionModel=SessionModel
  private bookingModel=BookingModel
  private specializationModel=SpecializationModel
  
  async existingUser(email: string): Promise<IUser | null> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }
  //saving otp
  async saveOTP(email: string, OTP: string, OTPExpirey: Date): Promise<void> {
    try {
    
      const newOtp = new this.otpModel({
        email,
        otp: OTP,
        expiresAt: OTPExpirey,
      });
      await newOtp.save();
    } catch (error) {
      console.error("error in saving the OTP", error);
      throw error;
    }
  }

  //fetching the otp by email
  async getOtpByEmail(email: string): Promise<IOtp[] | []> {
  
    try {
      return await this.otpModel.find({ email });
    } catch (error) {
      console.error("error in otp getting:", error);
      throw error;
    }
  }
  //create new user
  async createNewUser(userData: IUser): Promise<void> {
    
    try {
      const existingUser = await this.existingUser(userData.email);
      if (existingUser) {
        // If the user already exists, throw  error
        throw new Error("Email already exists");
      }
      const user = new this.userModel(userData);
      await user.save();
    } catch (error) {
      console.log("Error in creating user", error);
      throw error;
    }
  }

  //delete otp
  async deleteOtpById(otpId?: mongoose.Types.ObjectId): Promise<void> {
    try {
      if (!otpId) {
        throw new Error("OTP ID is undefined");
      }

      // Find OTP by ID and delete
      await this.otpModel.findByIdAndDelete(otpId.toString());
      console.log(`OTP with ID ${otpId} deleted successfully.`);
    } catch (error) {
      console.error("Error in deleting OTP:", error);
      throw error;
    }
  }

  //user for login

  async findUser(email: string): Promise<IUser | null> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      console.log("error finding user login:", error);
      return null;
    }
  }

  async createUser(user: {
    email: string;
    name: string;
    password: string | null;
  }): Promise<any> {
    const users = new this.userModel(user);
    return await users.save();
  }

  async findUserEmail(email: string) {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      console.log("error finding user login:", error);
      return null;
    }
  }
  async saveResetPassword(email: string, hashedPassword: string) {
    console.log("hee", email);
    console.log("reset reached in repos", hashedPassword);
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        console.log("User Not found  for this email", email);
      }
      const result = await this.userModel.updateOne(
        { email },
        { $set: { password: hashedPassword } }
      );
      if (result.modifiedCount === 0) {
        console.error("Failed to update password for email:", email);
        throw new Error("Password update failed.");
      }

      console.log("Password reset successfully for email:", email);
      return result;
    } catch (error) {
      console.log("Error in Resetting password", error);
      throw error;
    }
  }
  async getAllTrainers(){
    console.log("ïn repo")
    try{
    const trainers=await this.trainerModel.find({}).populate("specializations","name")
    
    
    return trainers
    }
    catch(error){
   console.log("error fetching trainersn in repository",error)
    }
  }
  async fetchAllSessionSchedules() {
    try {
      const schedules = await this.sessionModel.find({}).populate('specializationId')
      return schedules;
    } catch (error) {}
  }
  async getTrainer(trainerId: string) {
    try {
      const trainer = await this.trainerModel
        .find({ _id: trainerId })
        .populate("specializations");
      

      return trainer;
    } catch (error) {}
  }


   userIsBlocked = async (user_id: string): Promise<boolean> => {
        console.log("user id got in repo",user_id)
    try {
      
      const userDetails= await this.userModel.findById( user_id);
      console.log("userDetails are",userDetails)
      if (userDetails?.isBlocked === true) {
        return true;
      };
      return false
    } catch (error) {
      throw error;
    }
  }
  async findSessionDetails(sessionID: string) {
    console.log("seesion is",sessionID)
  const response=await this.sessionModel.findById(sessionID).populate<{specializationId:ISpecialization}>("specializationId")
  console.log("response of payment is ",response)
  return response
}
async findExistingBooking(bookingDetails:IBooking){
  try {
    const existinBooking= await this.bookingModel.findOne({sessionId: bookingDetails.sessionId,
      userId: bookingDetails.userId})
      await this.sessionModel.findByIdAndUpdate(
        { _id: bookingDetails.sessionId },
        { isBooked: true },
        { new: true }
      );
      return existinBooking
  } catch (error) {
    console.log("Error in existing booking repository",error)
    
  }
}

async createBooking(bookingDetails:IBooking){   
  try {
    console.log("booking details is",bookingDetails)
    const bookingnew =await this.bookingModel.create(bookingDetails)
    return bookingnew
  } catch (error) {
    console.error("Error creating booking:", error);
      throw new Error("Failed to create booking.");
  }

}
async fetchSpecializations(){
  try {
    
    const response=await this.specializationModel.find({})
  
  return response
  } catch (error) {
    console.log("Error in fetching specialization repository",error)
  }
}
async fetchUserData(userId:string):Promise<User|null>{
  try {
   const user= await this.userModel.findById(userId)
   return user as User | null; 

  } catch (error) {
    console.log("Error in Fetching User Data in Repository",error)
    return null
  
  }
}

async editUserData(userId:string,userData:User){
  try {
    const response=await this.userModel.findByIdAndUpdate(userId,userData,{new:true})
    return response
  } catch (error) {
    console.log("Error in UserEdit in Repository",error)
  }

}
async getBookedsessionData(userId:string){
  try {
    console.log("üser is in repo",userId)

    const bookings=await this.bookingModel.find({userId:userId}).populate("trainerId","name profileImage").exec()
    const response = bookings.map((booking: any) => {
      return {
        ...booking.toObject(),  
        trainerName: booking.trainerId ? booking.trainerId.name : 'Trainer not found',
        profileImage:booking.trainerId ? booking.trainerId.profileImage:"Trainer not found"
      };
    });
    console.log("response isssssssss",response)

    return response

  } catch (error) {
    console.log("Error in fetching userData in repository",error)
  }
}

}

export default UserRepository;
