import SpecializationModel from "../models/specializationModel";
import TrainerModel from "../models/trainerModel";
import { Interface_Trainer } from "../interface/trainer_interface";
import OtpModel from "../models/otpModel";
import { IOtp, ITransaction } from "../interface/common";
import mongoose, { Types } from "mongoose";
import KYCModel from "../models/KYC_Models";
import { ISession } from "../interface/trainer_interface";
import SessionModel from "../models/sessionModel";
import BookingModel from "../models/bookingModel";
import { IBooking } from "../interface/common";
import moment from "moment";
import { ITrainerRepository } from "../interface/trainer/Trainer.repository.interface";
import UserModel from "../models/userModel";
import BaseRepository from "./base/baseRepository";
import NotificationModel from "../models/notificationModel";
import WalletModel from "../models/walletModel";
import { MonthlyStats } from "../interface/trainer_interface";

class TrainerRepository extends BaseRepository<any> implements  ITrainerRepository{
  
  private _specializationModel = SpecializationModel;
  private _trainerModel = TrainerModel;
  private _otpModel = OtpModel;
  private _kycModel = KYCModel;
  private _sessionModel=SessionModel
  private _bookingModel=BookingModel
  private _notificationModel=NotificationModel
  private _walletModel=WalletModel
  private _userModel=UserModel

  constructor() {
    super(TrainerModel);  
  }


  async existingUser(email: string): Promise<Interface_Trainer | null> {
    try {
      return await this._trainerModel.findOne({ email });
    } catch (error) {
      throw error;
    }
    
  }

  async findAllSpecializations() {
    try {
      return await this._specializationModel.find({});
    } catch (error) {
      console.error("Error fetching specializations:", error);
      throw error;
    }
  }

  async existsTrainer(trainerData: Interface_Trainer) {
    try {
      let email = trainerData.email;
  
      return await this._trainerModel.findOne({ email });
    } catch (error) {
      console.log("error ", error);
      throw error;
    }
  }

  async saveOtp(email: string, OTP: string, OTPExpirey: Date) {
    try {
      const saveotp = await new this._otpModel({
        email,
        otp: OTP,
        expiresAt: OTPExpirey,
      });
      await saveotp.save();
    } catch (error) {
      console.log("Error in Saving The Otp", error);
      throw error;
    }
  }
  async getOtpByEmail(email: string): Promise<IOtp[] | []> {
    //////////OTPfetch
    try {
      return await this._otpModel.find({ email });
    } catch (error) {
      console.error("error in otp getting:", error);
      throw error;
    }
  }
  async createNewUser(trainerData: Interface_Trainer): Promise<any> {
    try {
      console.log("trainer data have reached in repository",trainerData)
      if (!trainerData.email) {
        throw new Error("Email is required");
      }
      const userexisted = await this.existingUser(trainerData.email);
      if (userexisted) {
        throw new Error("Email already exists");
      }

      let specializationIds: Types.ObjectId[] = [];
      console.log("Specializations before processing:", trainerData.specializations);

    if (trainerData.specializations && trainerData.specializations.length > 0) {
      
      specializationIds = await Promise.all(
        trainerData.specializations.map(async (specName) => {
          const specialization = await SpecializationModel.findOne({ name: specName });
          if (!specialization) {
            throw new Error(`Specialization '${specName}' not found`);
          }
          return specialization._id;
        })
      );
    }

      
    const trainer = new this._trainerModel({
      ...trainerData,
      specializations: specializationIds, 
    });
        
      await trainer.save();
    } catch (error) {
      console.log("Error in creating user", error);
      throw error;
    }
  }


  async saveOTP(email: string, OTP: string, OTPExpiry: Date): Promise<void> {
    try {
      const newOtp = new this._otpModel({
        email,
        otp: OTP,
        expiresAt: OTPExpiry,
      });

      await newOtp.save();
    } catch (error) {
      console.error("Error in saveOTP:", error);
      throw error;
    }
  }
  
  

  async deleteOtpById(otpId?: mongoose.Types.ObjectId): Promise<void> {
    try {
      if (!otpId) {
        throw new Error("OTP ID is undefined");
      }

      // Find OTP by ID and delete
      await this._otpModel.findByIdAndDelete(otpId.toString());
      console.log(`OTP with ID ${otpId} deleted successfully.`);
    } catch (error) {
      console.error("Error in deleting OTP:", error);
      throw error;
    }
  }

  async findTrainer(email: string): Promise<Interface_Trainer | null> {
    try {
      return await this._trainerModel.findOne({ email });
    } catch (error) {
      console.log("error finding user login:", error);
      return null;
    }
  }

  async findUserEmail(email: string) {
    try {
      return await this._trainerModel.findOne({ email });
    } catch (error) {
      console.log("error finding user login:", error);
      return null;
    }
  }

  async saveResetPassword(email: string, hashedPassword: string) {
  
    console.log("reset reached in repos", hashedPassword);
    try {
      const user = await this._trainerModel.findOne({ email });
      if (!user) {
        console.log("User Not found  for this email", email);
      }
      const result = await this._trainerModel.updateOne(
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

  async saveKyc(formData: any, documents: any): Promise<any> {

  
    try {
      let trainer = await this._trainerModel.findOne({ _id: formData.trainer_id }).select('specializations');
      if (!trainer) {
          throw new Error("Trainer not found for the given trainer ID");
      }

      console.log("-----specializations:", trainer.specializations);     
    
      const kycData = {
        trainerId: new Types.ObjectId(formData.trainer_id),
        specializationId: trainer.specializations,
        profileImage: documents.profileImageUrl,
        aadhaarFrontImage: documents.aadhaarFrontSideUrl,
        aadhaarBackImage: documents.aadhaarBackSideUrl,
        certificate: documents.certificateUrl,
        kycStatus: "pending",
        kycSubmissionDate: new Date(),
      };
        

      const savedKyc = await this._kycModel.create(kycData);
      console.log("KYC Data saved successfully:", savedKyc);
      return savedKyc;
    } catch (error) {
      console.error("Error in saveKyc repository:", error);
      throw new Error("Failed to save KYC data");
    }
  }


  async getTrainerStatus(trainerId: string) {
    console.log("get repository to getstatus><><><>,",trainerId)
    try {
      const trainer = await this._trainerModel.findById(trainerId).select("kycStatus")
      console.log(",,,,,,,,,,,,,,,,,,",trainer)
      

        
      if (!trainer) {
        throw new Error(`Trainer with ID ${trainerId} not found`);
      }
      
      console.log("..............trainerkycstatus",trainer.kycStatus)
      

      return trainer.kycStatus;
    } catch (error) {
      console.error("Error fetching trainer KYC status:", error);
      throw new Error("Failed to fetch trainer KYC status");
    }
  }

  
  async changeKycStatus(trainerId: string, profileImage: string | undefined): Promise<string | undefined> {
    try {
      // Update the trainers profile image and KYC status
      const trainerUpdate = await this._trainerModel.findByIdAndUpdate(
        trainerId,
        {
          kycStatus: "submitted",
          profileImage: profileImage,
        },
        { new: true, runValidators: true }
      );
  
      if (!trainerUpdate) {
        throw new Error("Trainer not found");
      }
  

      await this._kycModel.findOneAndUpdate(
        { trainerId: trainerId },
        { kycStatus: "submitted" },
        { new: true, runValidators: true }
      )
      return
    } catch (error) {
      console.error("Error changing trainer KYC status:", error);
      throw new Error("Failed to change trainer KYC status");
    }
  }

  async getSpecialization(trainerid:string){
    try {
      if(!trainerid){
        console.log("trainer id is not found")
        return
      }
      const specialisations=await this._trainerModel.findById(trainerid).populate("specializations")
      console.log("specialisation sare....",specialisations?.specializations)
      return specialisations
    } catch (error) {
      console.log("Error in Repository specialisation fetch",error)
    }

  }
  async createNewSession(sessiondata: ISession) {
    try {
      // Find trainer
      const findTrainer = await this._trainerModel.findById(sessiondata.trainerId);
      if (!findTrainer) {
        throw new Error("Trainer is not found");
      }
  
      // Fetch existing sessions for the same trainer
      const existingSessions = await this._sessionModel.find({
        trainerId: sessiondata.trainerId,
        startDate: sessiondata.startDate,
        $or: [
          {
            endDate: {
              $gte: sessiondata.startDate,
            },
          },
          {
            endDate: null,
          },
        ],
      });
  
      // Conflict checking
      const hasConflict = existingSessions.some((existingSession) => {
        const existingStartTime = moment(existingSession.startTime, "HH:mm");
        const existingEndTime = moment(existingSession.endTime, "HH:mm");
  
        const newStartTime = moment(sessiondata.startTime, "HH:mm");
        const newEndTime = moment(sessiondata.endTime, "HH:mm");
  
        // Check time overlap
        const timeRangeOverlaps = newStartTime.isBefore(existingEndTime) &&
                                  newEndTime.isAfter(existingStartTime);
  
        return timeRangeOverlaps;
      });
  
      if (hasConflict) {
        
        throw new Error("Time conflict with an existing session.");
      }
  
      // Set the price to a number if not already
      sessiondata.price = Number(sessiondata.price);
  
      // Create the session
      const createdSessionData = await this._sessionModel.create(sessiondata);
      return createdSessionData.populate("specializationId");
  
    } catch (error) {
      console.log("Error in Repository", error);
      throw error;
    }
  }
  
  async fetchSessionData(trainer_id: string) {
    try {
      const sesseionData = await this._sessionModel
        .find({
          trainerId: trainer_id,
        })
        .populate("specializationId")
        .sort({ createdAt: -1 });

      return sesseionData;
    } catch (error) {
      throw error;
    }
  }

  async fecthBookingDetails(trainerId: string){
try {
  console.log("booking details repository",trainerId)
  
  const bookingDetails=await  this._bookingModel.find({trainerId}).populate("userId","name").exec()
  //.populate({path:"userId",select:"name email",}).exec();
  const response = bookingDetails.map((booking: any) => {
    return {
      ...booking.toObject(),  
      userName: booking.userId ? booking.userId.name : 'user not found',
    
    };
  });
  return bookingDetails
 
} catch (error) {
  console.log("ërror in fetching booking dewtails",error)
}
  }

  async editStoreSessionData(sessionId:string,sessionData:any){
    try {
      const data = {
        selectedDate:sessionData.selectedDate,
        startTime:sessionData.startTime,
        endTime:sessionData.endTime,
        price:sessionData.price,
        endDate:sessionData.endDate
        
      }
      console.log("sessiondata is got in repo",sessionData)
      const updateSession=await this._sessionModel.findByIdAndUpdate(sessionId,data,{new:true})
      console.log("updated session is",updateSession)
      return updateSession
    } catch (error) {
      console.log("error in editStoreSessionData repository",error)
    }

  }
  
  async fetchTrainer(trainer_id: string) {
    try {
      const trainerData = await this._trainerModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(trainer_id) },
        },
        {
          $lookup: {
            from: "specializations",
            localField: "specializations",
            foreignField: "_id",
            as: "specializationDetails",
          },
        },
      ]);

      // console.log('trainerData', trainerData);
      return trainerData;
    } catch (error: any) {
      throw new Error(error);
    }
  }
  async fetchUeserDetails(userId: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      const userData = await UserModel.findById(userId);
      return userData;
    } catch (error) {
      throw error;
    }
  }
  
  async fetchNotifications(trainerId: string) {
    try {
      const notificationsDoc = await this._notificationModel.findOne({ receiverId: trainerId });
      if (notificationsDoc && notificationsDoc.notifications) {
        notificationsDoc.notifications.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return notificationsDoc;
    } catch (error) {
      console.error('Error finding notifications');
      throw new Error('Failed to find notifications')
      
    }
  }
  async deleteTrainerNotifications(trainerId: string) {
    try {
      await this._notificationModel.deleteOne({receiverId: trainerId})
    } catch (error) {
      console.error('Error delete notifications');
      throw new Error('Failed to delete notifications');
    }
  }

  async fetchWalletData(trainer_id: string) {
    try {
      const walletData = await this._walletModel.findOne({
        trainerId: trainer_id,
      });
      return walletData;
    } catch (error) {}
  }
  async withdrawMoney(trainer_id: string, amount: number) {
    try {
      const wallet = await this._walletModel.findOne({ trainerId: trainer_id });
      if (!wallet) {
        throw new Error("Wallet not found for the specified Trainer.");
      }
      if (wallet.balance < amount) {
        throw new Error("Insufficient balance for withdrawal.");
      }
      wallet.balance -= amount;
      const transactionId =
        "txn_" + Date.now() + Math.floor(Math.random() * 10000);
      const transaction: ITransaction = {
        amount: amount,
        transactionId: transactionId,
        transactionType: "debit",
      };
      wallet.transactions.push(transaction);
      await wallet.save();
      return wallet;
    } catch (error: any) {
      console.error("Error processing withdrawal:", error.message);
      throw new Error(error.message);
    }
  }
  async getAllStatistics() {
    

    // Fetch total revenue data
    const revenueData = await this._bookingModel.aggregate([
        { $match: { paymentStatus: "Confirmed" } },
        {
            $group: {
                _id: null,
                amount: { $sum: "$amount" },
                trainerRevenue: { $sum: { $multiply: ["$amount", 0.9] } },
            }
        }
    ]);
    const amount = revenueData.length > 0 ? revenueData[0].amount : 0;
    const trainerRevenue = revenueData.length > 0 ? revenueData[0].trainerRevenue : 0;

    // Set date range
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - 12);

    // Fetch user registration data
    const userRegistrationData = await this._userModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Initialize statistics for the last 12 months
    const monthlyStatistics: Record<string, {
        users: number;
        revenue: number;
        amount: number;
        trainerRevenue: number;
        trainer: number;
    }> = {};

    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
        const monthDate = new Date();
        monthDate.setMonth(currentDate.getMonth() - monthOffset);
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth() + 1;
        const key = `${year}-${month < 10 ? '0' : ''}${month}`;

        monthlyStatistics[key] = { users: 0, revenue: 0, amount: 0, trainerRevenue: 0, trainer: 0 };
    }

    // Map user registration data to statistics
    userRegistrationData.forEach(userData => {
        const key = `${userData._id.year}-${userData._id.month < 10 ? '0' : ''}${userData._id.month}`;
        if (monthlyStatistics[key]) {
            monthlyStatistics[key].users = userData.count;
        }
    });

    // Fetch revenue by month
    const revenueByMonth = await this._bookingModel.aggregate([
        { $match: { paymentStatus: "Confirmed", bookingDate: { $gte: startDate } } },
        {
            $group: {
                _id: { year: { $year: "$bookingDate" }, month: { $month: "$bookingDate" } },
                amount: { $sum: "$amount" },
                trainerRevenue: { $sum: { $multiply: ["$amount", 0.9] } }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    console.log("*************************", revenueByMonth);

    // Fetch revenue by trainer
    const revenueByTrainer = await this._bookingModel.aggregate([
        { $match: { paymentStatus: "Confirmed", bookingDate: { $gte: startDate } } },
        {
            $group: {
                _id: { trainer: "$trainerId", year: { $year: "$bookingDate" }, month: { $month: "$bookingDate" } },
                amount: { $sum: "$amount" },
                trainerRevenue: { $sum: { $multiply: ["$amount", 0.9] } }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    console.log("Trainer-wise Revenue:", revenueByTrainer);

    // Process revenue by trainer
    const trainerWiseData: Record<string, { year: number; month: number; revenue: number; trainerRevenue: number }[]> = {};

    revenueByTrainer.forEach(data => {
        const trainerId = data._id.trainer;
        const key = `${data._id.year}-${data._id.month < 10 ? '0' : ''}${data._id.month}`;

        if (!trainerWiseData[trainerId]) {
            trainerWiseData[trainerId] = [];
        }

        trainerWiseData[trainerId].push({
            year: data._id.year,
            month: data._id.month,
            revenue: data.amount,
            trainerRevenue: data.trainerRevenue
        });
    });

    console.log("Trainer-wise Data:", trainerWiseData);

    // Map revenue data to statistics
    revenueByMonth.forEach(revenueData => {
        const key = `${revenueData._id.year}-${revenueData._id.month < 10 ? '0' : ''}${revenueData._id.month}`;
        if (monthlyStatistics[key]) {
            monthlyStatistics[key].revenue = revenueData.amount;
            monthlyStatistics[key].amount = revenueData.amount;
            monthlyStatistics[key].trainerRevenue = revenueData.trainerRevenue;
        }
    });

    // Prepare final response
    const userTrainerChartData = Object.keys(monthlyStatistics).map(key => {
        const [year, month] = key.split('-');
        return {
            year: parseInt(year, 10),
            month: parseInt(month, 10),
            users: monthlyStatistics[key].users,
            trainer: monthlyStatistics[key].trainer,
            revenue: monthlyStatistics[key].revenue,
            amount: monthlyStatistics[key].amount,
            trainerRevenue: monthlyStatistics[key].trainerRevenue
        };
    });

    return {
        trainerRevenue,
        userTrainerChartData,
        trainerWiseData
    };
}

}

export default TrainerRepository;
