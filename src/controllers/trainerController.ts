import { NextFunction, Request, Response } from "express";

import TrainerService from "../services/trainerService"
import { Interface_Trainer } from "../interface/trainer_interface";
class TrainerController {
    private trainerService: TrainerService;
  
    constructor(trainerService: TrainerService) {
      this.trainerService = trainerService;
    }
    async getAllSpecializations(req: Request, res: Response, next: NextFunction) {
        try {
      
            const specializationsData =  await this.trainerService.findAllSpecializations();
            console.log("specialisationdaTA",specializationsData)
            res.status(200).json({ success: true, data: specializationsData });
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
          const trainer = await this.trainerService.registerTrainer(trainerData);
    
          res.status(200).json({ message: "OTP sent to email" });
          
        } catch (error) {
          console.error("Error in registerTrainer:", error);
          if ((error as Error).message === "Email already exists") {
            res.status(409).json({ message: "Email already exists" });
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
       await this.trainerService.verifyOtp(trainerData,otp)
       res.status(200).json({message:"OTP Veified Successfully",trainer:trainerData})
        }catch(error){
          console.error("OTP Verification Controller error:", error);
          if ((error as Error).message === "OTP has expired") {
            res.status(400).json({ message: "OTP has expired" });
          } else if ((error as Error).message === "Invalid OTP") {
            res.status(400).json({ message: "Invalid OTP" });
          } else if ((error as Error).message === "No OTP found for this email") {
            res.status(404).json({ message: "No OTP found for this email" });
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
    
          await this.trainerService.resendOTP(email);
          res.status(200).json({ message: "OTP resent successfully" });
        } catch (error) {
          console.error("Resend OTP Controller error:", error);
          if ((error as Error).message === "User not found") {
            res.status(404).json({ message: "User not found" });
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
          await this.trainerService.verifyForgotOTP(userData, otp);
    
          res
            .status(200)
            .json({ message: "OTP verified successfully", user: userData });
        } catch (error) {
          console.error("OTP Verification Controller error:", error);
          if ((error as Error).message === "OTP has expired") {
            res.status(400).json({ message: "OTP has expired" });
          } else if ((error as Error).message === "Invalid OTP") {
            res.status(400).json({ message: "Invalid OTP" });
          } else if ((error as Error).message === "No OTP found for this email") {
            res.status(404).json({ message: "No OTP found for this email" });
          } else {
           next(error)
          }
        }
      }
    

      async loginTrainer(req: Request, res: Response, next: NextFunction){
        try {
          console.log("-----reached here")
          const {email,password}=req.body
   let user=await this.trainerService.LoginTrainer(email,password)
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
     
     res.status(200).json({message:"login successfull",trainer:user.user,token:accessToken})
    
   }
        } catch (error:any) {
          console.error("Error in loginUser:", error.message);

          if(error.message==="Usernotfound"){
           res.status(404).json({message:"user not found"})
          }
          else if(error.message==="PasswordIncorrect"){
            res.status(401).json({message:"invalid credentials"})
           }else{
            next(error)
           }
        }
      }

      async refreshToken(req:Request,res:Response,next:NextFunction){
        const refresh_token=req.cookies?.refreshToken
        console.log("ït is in cookies.//././/./",refresh_token)
        if(!refresh_token){
          res.status(403).json({message:"Refresh Token Not found"})
          return 
        }
        try {
          const newAccessToken=await this.trainerService.generateNewAccessToken(refresh_token)
          const UserNewAccessToken=Object.assign({},{accessToken:newAccessToken})
          res.status(200).json({accessToken:UserNewAccessToken})
        
        } catch (error) {
          console.log("Error in Gnerating newAccesstoken",error)
          next(error)
          
        }
        }

        async forgotpassword(req:Request,res:Response,next:NextFunction):Promise<any>{
          try {
            const {emailData}=req.body
            console.log("got email from body",emailData)
            const response=await this.trainerService.forgotpassword(emailData)
            console.log("noll",response)
            if(!response){
              return res.status(400).json({message:"email not found"})
        
            }
            return res.status(200).json({message:"email vrified successfully",statusCode:200})
        
          } catch (error) {
            console.log("Error in Forgot password",error)
          }
        }
        async resetPassword(req:Request,res:Response,next:NextFunction):Promise<any>{
          try {
             const{userData,payload}=req.body
             console.log("*$*$*$*$",userData)
             const result=await this.trainerService.resetapassword(userData,payload)
             console.log("what is the response got?",result)
             if(result?.modifiedCount===1){
              return res.status(200).json({ message: "Password reset successfully" });
        
             }else{
              return res.status(400).json({ message: "Failed To Reset Password" });
        
             }
        
          } catch (error) {
            console.log("User Controller Error",error)
            return res.status(500).json({ message: "Server Error" });
        
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
            const kycStatus = await this.trainerService.kycSubmit(formData, files);
        
            // Return success response with KYC status
            res.status(200).json({ message: "KYC submitted successfully", kycStatus });
          } catch (error) {
            console.error("Error in KYC submission:", error);
            next(error);
          }
        }

        async trainerKycStatus(req: Request, res: Response, next: NextFunction) {
          try {
            const trainerId = req.params.trainerId;
            const kycStatus = await this.trainerService.kycStatus(trainerId);
      
            res.status(200).json({ kycStatus });
          } catch (error) {
            console.error("Error fetching trainer KYC status:", error);
            next(error)
          }
        }
        
        
}


export default TrainerController;
