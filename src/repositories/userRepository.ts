import { IOtp, IUser } from "../interface/common";
import UserModel from "../models/userModel";
import OtpModel from "../models/otpModel";
import mongoose from "mongoose";
import { User } from "../interface/user_interface";

class UserRepository {
  deleteOtpByEmail(useremail: string) {
    throw new Error("Method not implemented.");
  }
  private userModel = UserModel;
  private otpModel = OtpModel;
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
}

export default UserRepository;
