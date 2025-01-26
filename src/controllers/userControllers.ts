// UserController.ts
import { Request, Response, NextFunction } from "express";
import UserService from "../services/userService";
import { IUser } from "../interface/common";
import  {jwtDecode} from 'jwt-decode';
import {JwtPayload} from "../interface/common"
import HTTP_statusCode from "../enums/httpStatusCode";
import { IUserService } from "../interface/user/User.service.interface";
import { triggerAsyncId } from "async_hooks";
import {CustomRequest} from "../middlewares/authmiddlewares"


class UserController {
  private userService: IUserService;
  constructor(userServiceInstance: UserService) {
    this.userService = userServiceInstance;
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("reached in controller")
    try {

      const userData: IUser = req.body;
      
         
      await this.userService.register(userData);
      res.status(HTTP_statusCode.OK).json({ message: "Registration successful" });
    } catch (error:any) {
      console.error("error in register controller",error.message)
      //if((error as Error).message==="Email Already Exists")
      if(error.message==="Email Already Exists")
        {
          console.log("yes")
        res.status(409).json({message:"email already exists please login"})
        return
      }else{
        console.log("no")
        res.status(HTTP_statusCode.InternalServerError).json({message:"something went wrongtry again later"})
        return
     }
    //  if(error.message==="Email Already Exists"){
    //   return 
    //  }
    // res.status(HTTP_statusCode.InternalServerError).json({message:"internal server"})
    }
  }

  // Verify OTP
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    console.log("verify otp controller");
    try {
       console.log("verify otp controller");
      const { userData, otp } = req.body;
      
      await this.userService.verifyOTP(userData, otp);

      res
        .status(HTTP_statusCode.OK)
        .json({ message: "OTP verified successfully", user: userData });
    } catch (error) {
      console.error("OTP Verification Controller error:", error);
      if ((error as Error).message === "OTP has expired") {
        res.status( HTTP_statusCode.BadRequest).json({ message: "OTP has expired" });
      } else if ((error as Error).message === "Invalid OTP") {
        res.status(HTTP_statusCode.BadRequest).json({ message: "Invalid OTP" });
      } else if ((error as Error).message === "No OTP found for this email") {
        res.status(HTTP_statusCode.NotFound).json({ message: "No OTP found for this email" });
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
      
      await this.userService.verifyForgotOTP(userData, otp);

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

  async resendOtp(req:Request,res:Response,next:NextFunction){
    try {
      const {useremail}=req.body
      await this.userService.ResendOtp(useremail)
    } catch (error) { 
      console.log("error in resend otp",error)
    }
  }

async loginUser(req:Request,res:Response,next:NextFunction){
  try {
    const {email,password}=req.body
   let user=await this.userService.LoginUser(email,password)

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
     
     res.status(HTTP_statusCode.OK).json({message:"login successfull",user:user.user,token:accessToken})
    
   }


  } catch (error:any) {
    console.error("Error in loginUser:", error.message);
    if(error.message==="User Is Blocked!!"){
      res.status(HTTP_statusCode.NotFound).json({message:"user is blocked"})

    }

    if(error.message==="Usernotfound"){
     res.status(HTTP_statusCode.NotFound).json({message:"user not found"})
    }
    else if(error.message==="PasswordIncorrect"){
      res.status(HTTP_statusCode.Unauthorized).json({message:"invalid credentials"})
     }else{
      next(error)
     }

  }
}

async refreshToken(req:Request,res:Response,next:NextFunction){
const refresh_token=req.cookies?.refreshToken

if(!refresh_token){
  res.status(403).json({message:"Refresh Token Not found"})
  return 
}
try {
  const newAccessToken=await this.userService.generateNewAccessToken(refresh_token)
  const UserNewAccessToken=Object.assign({},{accessToken:newAccessToken})
  res.status(HTTP_statusCode.OK).json({accessToken:UserNewAccessToken})

} catch (error) {
  console.log("Error in Gnerating newAccesstoken",error)
  next(error)
  
}
}

async googleSignUpUser(req:Request,res:Response,next:NextFunction){
try {
  const token=req.body.token

  console.log("token is &&&&&",token)
  const decodedToken:JwtPayload=jwtDecode(token)
  const response=await this.userService.googleSignUpUser(decodedToken)
   res.status(HTTP_statusCode.OK).json({message:"user signed successfully"})
   return 
} catch (error) {
   console.error("Error during Google Sign Up:", error);
  // return res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal server error' });

}
}
async forgotpassword(req:Request,res:Response,next:NextFunction):Promise<any>{
  try {
    const {emailData}=req.body
    console.log("got email from body",emailData)
    const response=await this.userService.forgotpassword(emailData)
    console.log("noll",response)
    if(!response){
      return res.status(HTTP_statusCode.BadRequest).json({message:"email not found"})

    }
    return res.status(HTTP_statusCode.OK).json({message:"email vrified successfully",statusCode:HTTP_statusCode.OK})

  } catch (error) {
    console.log("Error in Forgot password",error)
  }
}
async resetPassword(req:Request,res:Response,next:NextFunction):Promise<any>{
  try {
     const{userData,payload}=req.body
    
     const result=await this.userService.resetapassword(userData,payload)
     console.log("what is the response got?",result)
     if(result?.modifiedCount===1){
      return res.status(HTTP_statusCode.OK).json({ message: "Password reset successfully" });

     }else{
      return res.status(HTTP_statusCode.BadRequest).json({ message: "Failed To Reset Password" });

     }

  } catch (error) {
    console.log("User Controller Error",error)
    return res.status(HTTP_statusCode.InternalServerError).json({ message: "Server Error" });

  }
}

async getAllTrainers(req:Request,res:Response,next:NextFunction){
  console.log("ïn controller")
  try {
    const allTrainers=await this.userService.getAllTrainers()
    
    res.status(HTTP_statusCode.OK).json(allTrainers)
    
  } catch (error) {
    console.log("Error fetching Trainers",error)
    
  }

}

async getSessionSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionSchedules = await this.userService.getSessionSchedules();
    res.status(HTTP_statusCode.OK).json(sessionSchedules);
  } catch (error) {
    next(error)
  }
}

async getTrainer(req: Request, res: Response, next: NextFunction) {
  try {
    
    const trainerId = req.params.trainerId;

    if (!trainerId) {
      res.status(HTTP_statusCode.BadRequest).json({ message: "Trainer ID is required" });
    }

    const trainer = await this.userService.getTrainer(trainerId);
    // console.log(trainer);

    if (!trainer) {
      res.status(HTTP_statusCode.NotFound).json({ message: "Trainer not found" });
    }

    res.status(HTTP_statusCode.OK).json(trainer);
  } catch (error) {
    console.error("Error in getTrainer controller:", error);
   next(error)
  }
}
async checkoutPayment(req: Request, res: Response, next: NextFunction){
  try {
    const userId=req.body.userData
    const sessionID=req.params.sessionId
    console.log("session id",sessionID,"user is",userId)
    const paymentResponse=await this.userService.checkoutPayment( sessionID,userId)
    console.log("iiiiiiiiiiii bpaymentResponse",paymentResponse)
    res.status(HTTP_statusCode.OK).json({ id: paymentResponse?.id });
  } catch (error) {
    console.log("error while payment in controller",error)
  }

}

async createBooking(req: Request, res: Response, next: NextFunction){
  try {
   
    const { sessionId, userId , stripe_session_id} = req.body;
    
    const bookingDetails = await this.userService.findBookingDetails(
      sessionId,
      userId,
      stripe_session_id
    );
  } catch (error) {
    console.log("Error in create booking in controller",error);
  }

}

async fetchAllSpecializations(req: Request, res: Response, next: NextFunction){

  try {
    const response=await this.userService.fetchSpecialization()
    
    res.status(HTTP_statusCode.OK).json(response)
  } catch (error) {
    console.log("Error in fetching specialization data in controller",error)
  }
}
async getUser(req: Request, res: Response, next: NextFunction){
  try {
    const userId=req.params.userId
   const response= await this.userService.fechtUserData(userId)
    res.status(HTTP_statusCode.OK).json({data:response})
  } catch (error) {
    
  }

}
async editUserData(req: Request, res: Response, next: NextFunction){
try {
  const userData=req.body
  const userId = req.body._id;
  const response=await this.userService.editUserData(userId,userData)
  res.status(HTTP_statusCode.OK).json(response)
} catch (error) {
  console.log("Error in edit userData",error)
}
}
/////////////
async getBookedsessionData(req: CustomRequest, res: Response, next: NextFunction){
console.log("hit")
  try {
    //const userId=req.params.userId
   const userId=req.authData?.id
    console.log("user id issssssss",userId)
    const response=await this.userService.getBookedsessionData(userId)
    
    res.status(HTTP_statusCode.OK).json({data:response})
  } catch (error) {
    console.log("Error while fetching booking details in controller",error)
  }
}

}

export default UserController;
