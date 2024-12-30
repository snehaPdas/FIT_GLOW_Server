// UserController.ts
import { Request, Response, NextFunction } from "express";
import UserService from "../services/userService";
import { IUser } from "../interface/common";
import  {jwtDecode} from 'jwt-decode';
import {JwtPayload} from "../interface/common"

class UserController {
  private userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const userData: IUser = req.body;
      console.log(req.body)
    
      await this.userService.register(userData);
      res.status(200).json({ message: "Registration successful" });
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
        res.status(500).json({message:"something went wrongtry again later"})
        return
     }
    //  if(error.message==="Email Already Exists"){
    //   return 
    //  }
    // res.status(500).json({message:"internal server"})
    }
  }

  // Verify OTP
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    console.log("verify otp controller");
    try {
       console.log("verify otp controller");
      const { userData, otp } = req.body;
       console.log("*************",otp,userData)
      await this.userService.verifyOTP(userData, otp);

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

  async verifyForgotOtp(req: Request, res: Response, next: NextFunction) {
    console.log("verify otp controller");
    try {
       console.log("verify otp controller");
      const { userData, otp } = req.body;
       console.log("*************",otp,userData)
      await this.userService.verifyForgotOTP(userData, otp);

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

  async resendOtp(req:Request,res:Response,next:NextFunction){
    try {
      const {useremail}=req.body
      await this.userService.ResendOtp(useremail)
    } catch (error) { 
      
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
     
     res.status(200).json({message:"login successfull",user:user.user,token:accessToken})
    
   }


  } catch (error:any) {
    console.error("Error in loginUser:", error.message);
    if(error.message==="User Is Blocked!!"){
      res.status(404).json({message:"user is blocked"})

    }

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
  const newAccessToken=await this.userService.generateNewAccessToken(refresh_token)
  const UserNewAccessToken=Object.assign({},{accessToken:newAccessToken})
  res.status(200).json({accessToken:UserNewAccessToken})

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
   res.status(200).json({message:"user signed successfully"})
   return 
} catch (error) {
   console.error("Error during Google Sign Up:", error);
  // return res.status(500).json({ message: 'Internal server error' });

}
}
async forgotpassword(req:Request,res:Response,next:NextFunction):Promise<any>{
  try {
    const {emailData}=req.body
    console.log("got email from body",emailData)
    const response=await this.userService.forgotpassword(emailData)
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
     const result=await this.userService.resetapassword(userData,payload)
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

}

export default UserController;
