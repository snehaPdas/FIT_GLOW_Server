import { NextFunction, Request, Response } from "express";
import HTTP_statusCode from "../enums/httpStatusCode";

import TrainerService from "../services/trainerService"
import { Interface_Trainer } from "../interface/trainer_interface";
import {ITrainerService} from "../interface/trainer/Trainer.service.interface"
import { IUser } from "../interface/common";
import { uploadToCloudinary } from "../config/clodinary";



class TrainerController {
    private _trainerService: ITrainerService;
  
    constructor(trainerServiceInstance: TrainerService) {
      this._trainerService = trainerServiceInstance;
    }
    async getAllSpecializations(req: Request, res: Response, next: NextFunction) {
    
        try {
      
            const specializationsData =  await this._trainerService.findAllSpecializations();
            console.log("specialisationdaTA",specializationsData)
            res.status(HTTP_statusCode.OK).json({ success: true, data: specializationsData });
          } catch (error) {
            console.error(
              "Error in controller while fetching specializations:",
              error
            );
            res
              next(error)
          }
    }
    async registerTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const trainerData: Interface_Trainer = req.body;
           console.log("datass",trainerData)
          const trainer = await this._trainerService.registerTrainer(trainerData);
    
          res.status(HTTP_statusCode.OK).json({ message: "OTP sent to email" });
          
        } catch (error) {
          console.error("Error in registerTrainer:", error);
          if ((error as Error).message === "Email already exists") {
            res.status(HTTP_statusCode.Conflict).json({ message: "Email already exists" });
            return;
          } else {
           
            next(error)
          }
        }
      }

      async verifyOtp(req: Request, res: Response, next: NextFunction){
        try{
       let {trainerData,otp}=req.body
       console.log("the otp entered from frontend",otp)
       await this._trainerService.verifyOtp(trainerData,otp)
       res.status(HTTP_statusCode.OK).json({message:"OTP Veified Successfully",trainer:trainerData})
        }catch(error){
          console.error("OTP Verification Controller error:", error);
          if ((error as Error).message === "OTP has expired") {
            res.status(HTTP_statusCode.BadRequest).json({ message: "OTP has expired" });
          } else if ((error as Error).message === "Invalid OTP") {
            res.status(HTTP_statusCode.BadRequest).json({ message: "Invalid OTP" });
          } else if ((error as Error).message === "No OTP found for this email") {
            res.status(HTTP_statusCode.NotFound).json({ message: "No OTP found for this email" });
          } else {
           next(error)
          }
        }
      }

      async resendOtp(
        req: Request<{ email: string }>,
        res: Response, next: NextFunction): Promise<void> {
        try {
          const { email } = req.body;
          // console.log(email,'trainer cont');
    
          await this._trainerService.resendOTP(email);
          res.status(HTTP_statusCode.OK).json({ message: "OTP resent successfully" });
        } catch (error) {
          console.error("Resend OTP Controller error:", error);
          if ((error as Error).message === "User not found") {
            res.status(HTTP_statusCode.NotFound).json({ message: "User not found" });
          } else {
           next(error)
          }
        }
      }
    

      async verifyForgotOtp(req: Request, res: Response, next: NextFunction) {
        console.log("verify otp controller");
        try {
           console.log("verify otp controller");
          const { userData, otp } = req.body;
           console.log("*************",otp,userData)
          await this._trainerService.verifyForgotOTP(userData, otp);
    
          res
            .status(HTTP_statusCode.OK)
            .json({ message: "OTP verified successfully", user: userData });
        } catch (error) {
          console.error("OTP Verification Controller error:", error);
          if ((error as Error).message === "OTP has expired") {
            res.status(HTTP_statusCode.BadRequest).json({ message: "OTP has expired" });
          } else if ((error as Error).message === "Invalid OTP") {
            res.status(HTTP_statusCode.BadRequest).json({ message: "Invalid OTP" });
          } else if ((error as Error).message === "No OTP found for this email") {
            res.status(HTTP_statusCode.NotFound).json({ message: "No OTP found for this email" });
          } else {
           next(error)
          }
        }
      }
    

      async loginTrainer(req: Request, res: Response, next: NextFunction){
        try {
          console.log("-----reached here")
          const {email,password}=req.body
   let user=await this._trainerService.LoginTrainer(email,password)
    

   if(user){
    const {accessToken,refreshToken}=user
     ///set Refresh token in the cookie and sent 
        

     res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      sameSite:"none",
      secure:true,
      maxAge:7 *24*60*60*1000
     })
     //passing access token as it is
     
     res.status(HTTP_statusCode.OK).json({message:"login successfull",trainer:user.user,token:accessToken})
    
   }
        } catch (error:any) {
          console.error("Error in loginUser:", error.message);

          if(error.message==="Usernotfound"){
           res.status(HTTP_statusCode.NotFound).json({message:"user not found"})
          }
          else if(error.message==="PasswordIncorrect"){
            res.status(HTTP_statusCode.updated).json({message:"invalid credentials"})
           }else{
            next(error)
           }
        }
      }

      async refreshToken(req:Request,res:Response,next:NextFunction){
        const refresh_token=req.cookies?.refreshToken
        console.log("ït is in cookies.//././/./",refresh_token)
        if(!refresh_token){
          res.status(HTTP_statusCode.NoAccess).json({message:"Refresh Token Not found"})
          return 
        }
        try {
          const newAccessToken=await this._trainerService.generateNewAccessToken(refresh_token)
          const UserNewAccessToken=Object.assign({},{accessToken:newAccessToken})
          res.status(HTTP_statusCode.OK).json({accessToken:UserNewAccessToken})
        
        } catch (error) {
          console.log("Error in Gnerating newAccesstoken",error)
          next(error)
          
        }
        }

        async forgotpassword(req:Request,res:Response,next:NextFunction):Promise<any>{
          try {
            const {emailData}=req.body
            console.log("got email from body",emailData)
            const response=await this._trainerService.forgotpassword(emailData)
            console.log("noll",response)
            if(!response){
              return res.status(HTTP_statusCode.BadRequest).json({message:"email not found"})
        
            }
            return res.status(HTTP_statusCode.OK).json({message:"email vrified successfully",statusCode:HTTP_statusCode.OK})
        
          } catch (error) {
            console.log("Error in Forgot password",error)
            next(error)

          }
        }
        async resetPassword(req:Request,res:Response,next:NextFunction):Promise<any>{
          try {
             const{userData,payload}=req.body
             console.log("*$*$*$*$",userData)
             const result=await this._trainerService.resetapassword(userData,payload)
             console.log("what is the response got?",result)
             if(result?.modifiedCount===1){
              return res.status(HTTP_statusCode.OK).json({ message: "Password reset successfully" });
        
             }else{
              return res.status(HTTP_statusCode.BadRequest).json({ message: "Failed To Reset Password" });
        
             }
        
          } catch (error) {
            console.log("User Controller Error",error)
            next(error)
            // return res.status(500).json({ message: "Server Error" });

        
          }
        }


        async kycSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
          try {
            const {  trainer_id,name, email, phone } = req.body;
        
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
            const formData = {
              // trainer_id,
              // specialization,
              name,
              email,
              phone,
              trainer_id
            };
             console.log("------------>>>>",formData)
             console.log("---->>>-------->>>>",files)


            // Pass formData and uploaded files to the service for KYC submission
            const kycStatus = await this._trainerService.kycSubmit(formData, files);
        
            // Return success response with KYC status
            res.status(HTTP_statusCode.OK).json({ message: "KYC submitted successfully", kycStatus });
          } catch (error) {
            console.error("Error in KYC submission:", error);
            next(error);
          }
        }

        async trainerKycStatus(req: Request, res: Response, next: NextFunction) {
          try {
            const trainerId = req.params.trainerId;
            const kycStatus = await this._trainerService.kycStatus(trainerId);
      
            res.status(HTTP_statusCode.OK).json({ kycStatus });
          } catch (error) {
            console.error("Error fetching trainer KYC status:", error);
            next(error)
          }
        }

        async getSpecialization(req:Request,res:Response,next:NextFunction){
        
          try {
            const trainerId=req.params.trainerId
            console.log("trainer id for specialization",trainerId)
            const specialisations=await this ._trainerService.getSpecialization(trainerId)
            
             res.status(HTTP_statusCode.OK).json({message:"specialisation fetched successfully",data:specialisations})
            
          } catch (error) {
            console.log("Error in contoller",error)
            next(error)
            
          }
        }

          async storeSessionData(req:Request,res:Response,next:NextFunction){
            console.log("reached in session place")
            try{

              const {selectedDate,startTime,endTime,startDate,endDate,specialization,price,type,status} =req.body

            
              const trainerId=req.params.trainerId
              const sessionData:any={}
              if(type==="Single"){

                sessionData.selectedDate=selectedDate,
                sessionData.startTime=startTime,
                sessionData.endTime=endTime,
                sessionData.specialization=specialization
                sessionData.price=price
                sessionData.type="single"
                sessionData.trainerId=trainerId
              }else{
                sessionData.specialization=specialization,
                sessionData.startDate=startDate,
                sessionData.endDate=endDate,
                sessionData.startTime=startTime,
                sessionData.endTime=endTime,
                sessionData.price=price,
                sessionData.type="package",
                sessionData.trainerId=trainerId

              }
          
            const sessioncreated=await this._trainerService.storeSessionData(sessionData)
            res
            .status(HTTP_statusCode.updated)
            .json({ message: "Session created successfully.", sessioncreated });

            }catch(error:any){
              if (error.message === "Time conflict with an existing session.") {
                res
                  .status(HTTP_statusCode.BadRequest)
                  .json({ message: "Time conflict with an existing session." });
              }  else if (error.message === "End time must be after start time") {
                res.status(HTTP_statusCode.BadRequest).json({ message: "End time must be after start time" });
              } else if (
                error.message === "Session duration must be at least 30 minutes"
              ) {
                res
                  .status(HTTP_statusCode.BadRequest)
                  .json({ message: "Session duration must be at least 30 minutes" });
              } else {
                console.error("Detailed server error:", error);
                next(error)
              }
            }
            


        }
        async getSessionSchedules(req: Request, res: Response, next: NextFunction) {
          try {
            const trainer_id = req.params.trainerId;
            const sheduleData = await this._trainerService.getSessionShedules(
              trainer_id
            );
            console.log('sheduleData',sheduleData);
      
            res
              .status(HTTP_statusCode.OK)
              .json({ message: "Session data feched sucessfully", sheduleData });
          } catch (error) {
            console.error("Error saving session data:", error);
           next(error)
          }
        }

        async fetchbookingDetails(req: Request, res: Response, next: NextFunction){
          try {
            console.log("reached booking details controller")
            const trainer_id = req.params.trainerId;
            const bookingDetails=await this._trainerService.fetchBookingDetails(trainer_id)
            console.log("controller checkinggg",bookingDetails)
            res.status(HTTP_statusCode.OK).json({data:bookingDetails})
          } catch (error) {
            console.error("Error fetching booking details:", error);

            res.status(500).json({ error: "Failed to fetch booking details." });

            
          }
        }

        async editStoreSessionData(req: Request, res: Response, next: NextFunction){
          try{
          console.log("reacheddddd edit store sessionnnn")
          const sessionId = req.params.sessionId;
          const sessionData=req.body
          console.log("---------------sessionData",sessionData)
          console.log("---------------trainer",sessionId )
          const response=this._trainerService.editStoreSessionData(sessionId,sessionData)
          res.status(HTTP_statusCode.OK).json({message:"updated successfully",data:response})
          }catch(error){
         console.log("Error in edit session",error)
         next(error)

          }
        }

        async getTrainer(req: Request, res: Response, next: NextFunction) {
          try {
            const trainer_id = req.params.trainerId;
            
            const trainerData = await this._trainerService.findTrainer(trainer_id);
            res.status(200).json({
              trainerData: trainerData,
            });
          } catch (error: any) {
            next(error)
          }
        }
        async fetchUser(req: Request, res: Response, next: NextFunction) {
          try {
            const userId=req.params.userId
            const userData = await this._trainerService.fetchUser(userId)
            res.status(200).json(userData)
          } catch (error) {
            next(error)
          }
        }


        
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { trainer_id } = req.params;
      const notifications = await this._trainerService.getNotifications(trainer_id);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }
  async clearNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const {trainer_id} = req.params
      await this._trainerService.clearNotifications(trainer_id)
      res.status(200).json({message:'Notifications cleared successfully'})
    } catch (error) {
      next(error)
    }
  }
  async getWalletData(req: Request, res: Response, next: NextFunction) {
    try {
      const trinerId = req.params.trainer_id
      const walletData = await this._trainerService.getWallet(trinerId)
      res.status(200).json(walletData)
    } catch (error) {
      next(error)
    }
  }
  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
     const {trainer_id} = req.params
     const {amount} = req.body
 
     const withdrawed = await this._trainerService.withdraw(trainer_id, amount)
     res.status(200).json(withdrawed)
    } catch (error) {
     next(error)
    }
   }
   async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this._trainerService.getDashboardData()
      
      res.status(200).json({data: response})
    } catch (error) {
      next(error)
    }
 

  } 
  async dietPlan(req: Request, res: Response, next: NextFunction){
    
    console.log("Incoming request body:", req.body); 

try {
  const {userId}=req.params
  const dietPlans=req.body
  console.log("dietPlans",dietPlans)
 const response=await this._trainerService.dietPlan(userId,dietPlans)
 res.status(201).json({ message: "Diet Plan added successfully", dietPlan: response });

} catch (error) {
  console.log("Error is",error)
}
  }


  async getDietPlan(req: Request, res: Response, next: NextFunction) {
    console.log("&&&&&&&&&&&????????")
    try {
      const { userId } = req.params;
      const dietplandetails = await this._trainerService.getDietPlan(userId);
      res.status(200).json(dietplandetails);
    } catch (error) {
      next(error);
    }
  }

  async updateTrainer(req: Request, res: Response, next: NextFunction) {
    try {
      const trainer_id = req.params.trainer_id;
      const trainerData = req.body;
      const existingTrainerProfile = await this._trainerService.fetchTrainer(trainer_id)
      if(existingTrainerProfile) {
         await deleteFromCloudinary(existingTrainerProfile)
      }
      const documents: { [key: string]: string | undefined } = {};
      if (req.file) {
        const profileImageUrl:any = await uploadToCloudinary(
          req.file.buffer,
          "trainer_profileImage"
        );
        documents.profileImage = profileImageUrl.secure_url;
      }
      const updatedTrainerData = { ...trainerData, ...documents };
      const updatedTrainer = await this._trainerService.updateTrainer(
        trainer_id,
        updatedTrainerData
      );
      res.status(200).json({
        message: "Trainer updated successfully",
        updatedTrainer,
      });
    } catch (error) {
      next(error);
    }
  }
  
  
        
}




export default TrainerController;
function deleteFromCloudinary(existingTrainerProfile: any) {
  throw new Error("Function not implemented.");
}

