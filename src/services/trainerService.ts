import TrainerRepository from "../repositories/trainerRepository";
import { Interface_Trainer } from "../interface/trainer_interface";
import sendMail from "../config/email_config";
import { otpEmailTemplate } from "../config/otpTemplate";
import bcrypt from "bcrypt"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtHelper";
import { uploadToCloudinary } from "../config/clodinary";
import { ISession } from "../interface/trainer_interface";
import { ITrainerService } from "../interface/trainer/Trainer.service.interface";
import { ITrainerRepository } from "../interface/trainer/Trainer.repository.interface";


class TrainerService implements ITrainerService {
    private _trainerRepository: ITrainerRepository;
    private _OTP: string | null = null;
    private _expiryOTP_time:Date | null=null

    constructor(trainerRepository: ITrainerRepository) {
        this._trainerRepository = trainerRepository;
      }
  trainerService(trinerId: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
      async findAllSpecializations() {
        try {
        const  response=await this._trainerRepository.findAllSpecializations();
        console.log("response gotttt",response)
        return response
        } catch (error) {
          console.error("Error in service while fetching specializations:", error);
          throw error;
        }
      }
      async registerTrainer(trainerData: Interface_Trainer) {
        console.log("trainer data is",trainerData)
        try {
             
          if (!trainerData.email) {
            throw new Error("Email is required for registration");
          }
          const existingTrainer = await this._trainerRepository.existsTrainer(trainerData);
          console.log("existingTrainer",existingTrainer)
          if(existingTrainer){
            throw new Error("Email already exist")
          }
          const generateOtp=Math.floor(1000+ Math.random()*9000).toString()
           this._OTP=generateOtp
           console.log("the otp is:...",this._OTP)
           const email_Ht=otpEmailTemplate(this._OTP,trainerData.name||"user")
           const sentEmail=await sendMail(" your otp for Registration is: ",trainerData.email,email_Ht)
           if(!sentEmail){throw new Error("Email not sent")}
           const OTP_createdTime=new Date()
           this._expiryOTP_time=new Date(OTP_createdTime.getTime()+1*60*1000)
           await this._trainerRepository.saveOtp(trainerData.email,this._OTP,this._expiryOTP_time)
            
        } catch (error) {
          console.error("Error in service:", );
          throw new Error("Error in Trainer service");
        }
      }


      async verifyOtp(trainerData:Interface_Trainer,otp:string){
        

        try {
          if (!trainerData.email) {
            throw new Error("Trainer email is required");
          }
          
          const validateOtp=await this._trainerRepository.getOtpByEmail(trainerData.email)
          console.log("the validateOtp is..",validateOtp)
          if(validateOtp.length===0){
            console.log("there is no otp in email")
            throw new Error("no OTP found for this email")
          }
          const sortedOtp = validateOtp.sort((a, b) => {
            if (b.createdAt.getTime() !== a.createdAt.getTime()) {
                return b.createdAt.getTime() - a.createdAt.getTime(); // Sort by createdAt in descending order
            } else {
                return b.expiresAt.getTime() - a.expiresAt.getTime(); // If createdAt is the same, sort by expiresAt
            }
        });
                 const latestOtp = sortedOtp[0];
                  if (latestOtp.otp === otp) {
                  if (latestOtp.expiresAt > new Date()) {
                    console.log("otp expiration not working");
          
                    console.log("OTP is valid and verified", latestOtp.expiresAt);
                    if (!trainerData.password) {
                      throw new Error("Password is required for OTP verification");
                    }
                    const hashedPassword = await bcrypt.hash(trainerData.password, 10);
                    
                    const newUserData = { ...trainerData, password: hashedPassword };
                    await this._trainerRepository.createNewUser(newUserData);
                    console.log("User successfully stored.");
                    await this._trainerRepository.deleteOtpById(latestOtp._id);
                  } else {
                    console.log("OTP has expired");
                    await this._trainerRepository.deleteOtpById(latestOtp._id);
                    throw new Error("OTP has expired");
                  }
                } else {
                  console.log("Invalid OTP");
                  throw new Error("Invalid OTP");
                }
          
          
        } catch (error) {
          const errorMessage =
        (error as Error).message || "An unknown error occurred";
      console.error("Error in OTP verification:", errorMessage);
      throw error;
        }

      }

      async resendOTP(email: string): Promise<void> {
        try {
          const generatedOTP: string = Math.floor(
            1000 + Math.random() * 9000
          ).toString();
          this._OTP = generatedOTP;
    
          const OTP_createdTime = new Date();
          this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
    
          await this._trainerRepository.saveOTP(
            email,
            this._OTP,
            this._expiryOTP_time
          );
    
          const email_Ht=otpEmailTemplate(this._OTP,email||"user")
           const sentEmail=await sendMail(" your otp for Registration is: ",email,email_Ht)
           if(!sentEmail){throw new Error("Email not sent")}
    
          console.log(`Resent OTP ${this._OTP} to ${email}`);
        } catch (error) {
          console.error("Error in resendOTP:", (error as Error).message);
          throw error;
        }
      }

      async verifyForgotOTP(userData: string, otp: string): Promise<void> {
      
        try {
          const validateOtp = await this._trainerRepository.getOtpByEmail(userData);
          console.log("the validateOtp is..", validateOtp);
          if (validateOtp.length === 0) {
            console.log("there is no otp in email");
            throw new Error("no OTP found for this email");
          }
          const sortedOtp = validateOtp.sort((a, b) => {
            if (b.createdAt.getTime() !== a.createdAt.getTime()) {
                return b.createdAt.getTime() - a.createdAt.getTime(); 
            } else {
                return b.expiresAt.getTime() - a.expiresAt.getTime(); 
            }
        });

        const latestOtp = sortedOtp[0];


          if (latestOtp.otp === otp) {
            if (latestOtp.expiresAt > new Date()) {
              console.log("otp expiration not working");
    
              console.log("OTP is valid and verified", latestOtp.expiresAt);
              
    
              await this._trainerRepository.deleteOtpById(latestOtp._id);
            } else {
              console.log("OTP has expired");
              await this._trainerRepository.deleteOtpById(latestOtp._id);
              throw new Error("OTP has expired");
            }
          } else {
            console.log("Invalid OTP");
            throw new Error("Invalid OTP");
          }
        } catch (error) {
          const errorMessage =
            (error as Error).message || "An unknown error occurred";
          console.error("Error in OTP verification:", errorMessage);
          throw error;
        }
      }
    
      async LoginTrainer(email:string,password:string):Promise<any>{
        try{
          console.log("pppp")
          const trainer:Interface_Trainer|null=await this._trainerRepository.findTrainer(email)
      
          if (!trainer) {
            console.log("User not found")
            throw new Error("Usernotfound")
          }
          if (!trainer.password) {
            throw new Error("Trainer password is missing");
          }
          const ispasswordvalid=await bcrypt.compare(password,trainer.password)
          
          

          if(!ispasswordvalid){
            throw new Error("PasswordIncorrect")
          }
          if (!trainer.email) {
            throw new Error("Trainer email is missing");
          }
          //Access Token Generation
         const accessToken=generateAccessToken({id:trainer._id?.toString() || "",email:trainer.email,role:"trainer"})
         
         
         //Refresh Token Generate
         const refreshToken=generateRefreshToken({ id: trainer._id?.toString() || "", email: trainer.email})
         return{
          accessToken,
          refreshToken,
          user:{
            id: trainer._id?.toString(),
            name: trainer.name,
            email: trainer.email,
            phone: trainer.phone,
          }
         }
        
        }catch(error:any){
          console.log("Erron in login ",error)
          throw error
        }
        
      }

      async generateNewAccessToken(user_refresh_token:string){
        
        try{
          
        const payload=verifyRefreshToken(user_refresh_token)
        let id: string | undefined;
            let email: string | undefined;
            
            if (payload && typeof payload === "object") {
              id = payload?.id;
              email = payload?.email;
            }
            if (id && email) {
              const role = 'trainer'
              const userNewAccessToken = generateAccessToken({ id, email,role });
              console.log("---->>>created new accessrtoken here check",userNewAccessToken)
              return userNewAccessToken;
            } else {
              throw new Error("Invalid token payload structure");
            }
          
          } 
          catch (error) {
            console.error("Error generating token:", error);
            throw error;
          }
      
      }

      async forgotpassword(UserEmail: string): Promise<any> {
        try {
          console.log("kkkk", UserEmail);
    
          const userResponse = await this._trainerRepository.findUserEmail(UserEmail);
          if (!userResponse) {
            console.log("user not already exist", userResponse);
            throw new Error("Invalid email Address");
          }
          const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
          this._OTP = generateOtp;
          console.log("Trainer Generated OTP is", this._OTP);
    
          //send otp to the email:
          const isMailSet = await sendMail("otp", UserEmail, this._OTP);
          if (!isMailSet) {
            throw new Error("Email not sent");
          }
    
          const OTP_createdTime = new Date();
          this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
          //store OTP IN db
          await this._trainerRepository.saveOtp(
            UserEmail,
            this._OTP,
            this._expiryOTP_time
          );
          console.log(`OTP will expire at: ${this._expiryOTP_time}`);
    
          return userResponse;
        } catch (error) {
          console.log("Error in userservice forgot password", error);
        }
      }

       async resetapassword(userData: string, payload: { newPassword: string }) {
          console.log("got pay load", payload, userData);
          try {
            const { newPassword }: { newPassword: string } = payload;
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            console.log("hashed", hashedPassword);
            const response = await this._trainerRepository.saveResetPassword(
              userData,
              hashedPassword
            );
            console.log("response check in userservice ", response);
            return response;
          } catch (error) {
            console.log("error is",error)
          }
        }

        async kycSubmit(formData: any, files: { [fieldname: string]: Express.Multer.File[] }): Promise<any> {
          try {
            console.log("got....",formData)
            const documents: { [key: string]: string | undefined } = {};
        
      
            if (files.profileImage?.[0]) {
              const profileImageUrl:any = await uploadToCloudinary(
                files.profileImage[0].buffer,
                "trainer_profileImage"
              );
            
              documents.profileImageUrl = profileImageUrl.secure_url;
            }
        
            if (files.adhar?.[0]) {
              const aadhaarFrontSideUrl:any = await uploadToCloudinary(
                files.adhar[0].buffer,
                "trainer_aadhaarFrontSide"
              );
              console.log("**********>>>>",aadhaarFrontSideUrl)
              documents.aadhaarFrontSideUrl = aadhaarFrontSideUrl.secure_url;
            }
        
            if (files.adharback?.[0]) {
              const aadhaarBackSideUrl:any = await uploadToCloudinary(
                files.adharback[0].buffer,
                "trainer_aadhaarBackSide"
              );
              documents.aadhaarBackSideUrl = aadhaarBackSideUrl.secure_url;
            }
        
            if (files.certificate?.[0]) {
              const certificateUrl:any = await uploadToCloudinary(
                files.certificate[0].buffer,
                "trainer_certificate"
              );
              documents.certificateUrl = certificateUrl.secure_url;
            }
        
            // Save KYC data in the repository
             await this._trainerRepository.saveKyc(formData, documents);
           
        
            // Change KYC status in the repository
            return await this._trainerRepository.changeKycStatus(
              formData.trainer_id,
              documents.profileImageUrl
            );
          } catch (error) {
            console.error("Error in kycSubmit service:", error);
            throw new Error("Failed to submit KYC data");
          }
        }


        async kycStatus(trainerId: string) {
          console.log("reached in service")
          console.log("trainer id is",trainerId)

          try {
            const kycStatus = await this._trainerRepository.getTrainerStatus(trainerId)
            return kycStatus;
          } catch (error) {
            console.error("Error in kycStatus service:", error);
            throw new Error("Failed to retrieve KYC status");
          }
        }

     async getSpecialization(trainerId:string){

     try {
        return await this._trainerRepository.getSpecialization(trainerId)
     } catch (error) {
      console.log("Error in service while specialization fetching",error)
     }
     }

     async storeSessionData(sessiondata:ISession){
      console.log("yes no problem here")
      try{
        const startTimeInput = sessiondata.startTime;
        const endTimeInput = sessiondata.endTime;

        const startTime = new Date(`1970-01-01T${startTimeInput}`);
        const endTime = new Date(`1970-01-01T${endTimeInput}`);
  
        if (startTime >= endTime) {
          throw new Error("End time must be after start time");
        }

        const MINIMUM_SESSION_DURATION = 30;
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

      if (duration < MINIMUM_SESSION_DURATION) {
        throw new Error("Session duration must be at least 30 minutes");
      }
     return  await this._trainerRepository.createNewSession(sessiondata)

      }catch(error:any){
        if (error.message.includes("Daily session limit")) {
          throw new Error(error.message);
        } else if (error.message === "Time conflict with an existing session.") {
          throw new Error("Time conflict with an existing session.");
        } else if (error.message === "End time must be after start time") {
          throw new Error("End time must be after start time");
        } else if (
          error.message === "Session duration must be at least 30 minutes"
        ) {
          throw new Error("Session duration must be at least 30 minutes");
        } else {
          throw new Error("Error creating new session");
        }      }
      

     }
     async getSessionShedules(trainer_id: string) {
      try {
        return await this._trainerRepository.fetchSessionData(trainer_id)
      } catch (error) {
        throw new Error("Error getting sessin shedule data");
      }
    }
    async fetchBookingDetails(trainer_id:string){
      try {
        console.log("reached trainerbooking service")
        const response=await this._trainerRepository.fecthBookingDetails(trainer_id)
        return response
      } catch (error) {
        console.log("Error fect booking details",error)
      }
    }

    async editStoreSessionData(sessionId:string,sessionData:string){
      try {
        return await this._trainerRepository.editStoreSessionData(sessionId,sessionData)
        
      } catch (error) {
        console.log("error in editStoreSessionData service",error)
      }

    }
    async findTrainer(trainer_id: string) {
      try {
        return await this._trainerRepository.fetchTrainer(trainer_id);
      } catch (error: any) {
        throw Error(error);
      }
    }

    async fetchUser(userId: string) {
      return await this._trainerRepository.fetchUeserDetails(userId)
    }

    async getNotifications(trainerId: string) {
      try {
        return await this._trainerRepository.fetchNotifications(trainerId)
      } catch (error) {
        throw new Error('failed to find notifications')
      }
     }

     async clearNotifications(trainerId: string) {
      try {
        return await this._trainerRepository.deleteTrainerNotifications(trainerId)
      } catch (error) {
        throw new Error('failed to delete notifications')
      }
     }
  
     async getWallet(trainer_id: string) {
      return await this._trainerRepository.fetchWalletData(trainer_id)
    }
  
    async withdraw (trainer_id:string, amount: number)  {
      try {
        return await this._trainerRepository.withdrawMoney(trainer_id, amount)
      } catch (error: any) {
        throw Error(error)
      }
    }

}


export default TrainerService;
