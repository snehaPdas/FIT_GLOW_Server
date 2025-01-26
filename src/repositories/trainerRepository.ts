import SpecializationModel from "../models/specializationModel";
import TrainerModel from "../models/trainerModel";
import { Interface_Trainer } from "../interface/trainer_interface";
import OtpModel from "../models/otpModel";
import { IOtp } from "../interface/common";
import mongoose, { Types } from "mongoose";
import KYCModel from "../models/KYC_Models";
import { ISession } from "../interface/trainer_interface";
import SessionModel from "../models/sessionModel";
import BookingModel from "../models/bookingModel";
import { IBooking } from "../interface/common";
import moment from "moment";
import { ITrainerRepository } from "../interface/trainer/Trainer.repository.interface";

class TrainerRepository implements  ITrainerRepository{
  
  private specializationModel = SpecializationModel;
  private trainerModel = TrainerModel;
  private otpModel = OtpModel;
  private kycModel = KYCModel;
  private sessionModel=SessionModel
  private bookingModel=BookingModel

  async existingUser(email: string): Promise<Interface_Trainer | null> {
    try {
      return await this.trainerModel.findOne({ email });
    } catch (error) {
      throw error;
    }
    
  }

  async findAllSpecializations() {
    try {
      return await this.specializationModel.find({});
    } catch (error) {
      console.error("Error fetching specializations:", error);
      throw error;
    }
  }

  async existsTrainer(trainerData: Interface_Trainer) {
    try {
      let email = trainerData.email;
  
      return await this.trainerModel.findOne({ email });
    } catch (error) {
      console.log("error ", error);
      throw error;
    }
  }

  async saveOtp(email: string, OTP: string, OTPExpirey: Date) {
    try {
      const saveotp = await new this.otpModel({
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
      return await this.otpModel.find({ email });
    } catch (error) {
      console.error("error in otp getting:", error);
      throw error;
    }
  }
  async createNewUser(trainerData: Interface_Trainer): Promise<void> {
    try {
      console.log("trainer data have reached in repository",trainerData)
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

      
    const trainer = new this.trainerModel({
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
      const newOtp = new this.otpModel({
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
      await this.otpModel.findByIdAndDelete(otpId.toString());
      console.log(`OTP with ID ${otpId} deleted successfully.`);
    } catch (error) {
      console.error("Error in deleting OTP:", error);
      throw error;
    }
  }

  async findTrainer(email: string): Promise<Interface_Trainer | null> {
    try {
      return await this.trainerModel.findOne({ email });
    } catch (error) {
      console.log("error finding user login:", error);
      return null;
    }
  }

  async findUserEmail(email: string) {
    try {
      return await this.trainerModel.findOne({ email });
    } catch (error) {
      console.log("error finding user login:", error);
      return null;
    }
  }

  async saveResetPassword(email: string, hashedPassword: string) {
  
    console.log("reset reached in repos", hashedPassword);
    try {
      const user = await this.trainerModel.findOne({ email });
      if (!user) {
        console.log("User Not found  for this email", email);
      }
      const result = await this.trainerModel.updateOne(
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
      let trainer = await this.trainerModel.findOne({ _id: formData.trainer_id }).select('specializations');
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
        

      const savedKyc = await this.kycModel.create(kycData);
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
      const trainer = await this.trainerModel.findById(trainerId).select("kycStatus")
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
      const trainerUpdate = await this.trainerModel.findByIdAndUpdate(
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
  

      await this.kycModel.findOneAndUpdate(
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
      const specialisations=await this.trainerModel.findById(trainerid).populate("specializations")
      console.log("specialisation sare....",specialisations?.specializations)
      return specialisations
    } catch (error) {
      console.log("Error in Repository specialisation fetch",error)
    }

  }
  async createNewSession(sessiondata: ISession) {
    try {
      // Find trainer
      const findTrainer = await this.trainerModel.findById(sessiondata.trainerId);
      if (!findTrainer) {
        throw new Error("Trainer is not found");
      }
  
      // Fetch existing sessions for the same trainer
      const existingSessions = await this.sessionModel.find({
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
        console.log("........................")
        throw new Error("Time conflict with an existing session.");
      }
  
      // Set the price to a number if not already
      sessiondata.price = Number(sessiondata.price);
  
      // Create the session
      const createdSessionData = await this.sessionModel.create(sessiondata);
      return createdSessionData.populate("specializationId");
  
    } catch (error) {
      console.log("Error in Repository", error);
      throw error;
    }
  }
  
  async fetchSessionData(trainer_id: string) {
    try {
      const sesseionData = await this.sessionModel
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
  
  const bookingDetails=await  this.bookingModel.find({trainerId}).exec()
  //.populate({path:"userId",select:"name email",}).exec();
  console.log("..........booking details",bookingDetails)
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
      const updateSession=await this.sessionModel.findByIdAndUpdate(sessionId,data,{new:true})
      console.log("updated session is",updateSession)
      return updateSession
    } catch (error) {
      console.log("error in editStoreSessionData repository",error)
    }

  }
  
 

}

export default TrainerRepository;
