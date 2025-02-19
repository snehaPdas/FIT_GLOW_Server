// userService.ts
// import UserRepository from "../repositories/userRepository";
import sendMail from "../config/email_config";
import { IBooking, IUser } from "../interface/common";
import bcrypt from "bcrypt";
import { JwtPayload } from "../interface/common";
import { generateAccessToken } from "../utils/jwtHelper";
import { generateRefreshToken } from "../utils/jwtHelper";
import { verifyRefreshToken } from "../utils/jwtHelper"
import stripeClient from "../config/stripeClients";
import mongoose from "mongoose";
// import stripe from "stripe";
import { IUserService } from "../interface/user/User.service.interface";
import { IUserRepository } from "../interface/user/User.repository.interface";
import {User} from "../interface/user_interface"
import { Interface_Trainer } from "../interface/trainer_interface";

class UserService implements IUserService {
  private _userRepository: IUserRepository;
  private _OTP: string | null = null;
  private _expiryOTP_time: Date | null = null;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  // Register user and send OTP
  async register(userData: IUser): Promise<void> {
    console.log("in service")
    try {
      const existedUser = await this._userRepository.existingUser(userData.email)
      console.log("in service....",)

      if (existedUser) {
        console.log("user already exist", existedUser);
        throw new Error("Email Already Exists");
      }
      const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
      this._OTP = generateOtp;
      console.log("Generated OTP is", this._OTP);

      //send otp to the email:
      const isMailSet = await sendMail("otp", userData.email, this._OTP);
      if (!isMailSet) {
        throw new Error("Email not sent");
      }

      const OTP_createdTime = new Date();
      this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
      //store OTP IN db
      await this._userRepository.saveOTP(
        userData.email,
        this._OTP,
        this._expiryOTP_time
      );
      console.log(`OTP will expire at: ${this._expiryOTP_time}`);
    } catch (error) {
      console.error("error in service:", (error as Error).message);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(userData: IUser, otp: string): Promise<void> {
  try {
      const validateOtp = await this._userRepository.getOtpByEmail(
        userData.email
      );
      console.log("the total otp in mail validateOtp is.....", validateOtp);
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

      
      console.log("User-entered OTP:", otp);
    console.log("Latest OTP from database:", latestOtp.otp);

      if (latestOtp.otp === otp) {
        if (latestOtp.expiresAt > new Date()) {
          console.log("otp expiration not working");

          console.log("OTP is valid and verified", latestOtp.expiresAt);

          const hashedPassword = await bcrypt.hash(userData.password, 10);
          const newUserData = { ...userData, password: hashedPassword };
          await this._userRepository.createNewUser(newUserData);
          console.log("User successfully stored.");
          await this._userRepository.deleteOtpById(latestOtp._id);
        } else {
          console.log("OTP has expired");
          await this._userRepository.deleteOtpById(latestOtp._id);
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

  async verifyForgotOTP(userData: string, otp: string): Promise<void> {
    try {
      const validateOtp = await this._userRepository.getOtpByEmail(userData);
      console.log("the validateOtp is..", validateOtp);
      if (validateOtp.length === 0) {
        console.log("there is no otp in email");
        throw new Error("no OTP found for this email");
      }
      const latestOtp = validateOtp.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];
      if (latestOtp.otp === otp) {
        if (latestOtp.expiresAt > new Date()) {
          console.log("otp expiration not working");

          console.log("OTP is valid and verified", latestOtp.expiresAt);

          await this._userRepository.deleteOtpById(latestOtp._id);
        } else {
          console.log("OTP has expired");
          await this._userRepository.deleteOtpById(latestOtp._id);
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

  async ResendOtp(useremail: string) {
    try {
      const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const OTP_createdTime = new Date();
      const expireyTime = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
      await this._userRepository.saveOTP(useremail, generateOtp, expireyTime);
      this._OTP=generateOtp
      console.log("new generateOtp is:", generateOtp);
      

      const isMailSent = await sendMail("otp", useremail, this._OTP);
      if (!isMailSent) {
        throw new Error("Email not sent");
      }
      console.log(`otp:::Resent OTP ${this._OTP} to ${useremail}`);
     
    } catch (error) {
      console.error("Error in resend otp:", error);
    }
  }

  async LoginUser(email: string, password: string): Promise<any> {
    try {
      const user: IUser | null = await this._userRepository.findUser(email);
      console.log("------>", user);
      if (!user) {
        console.log("User not found");
        throw new Error("Usernotfound");
      }
      if(user){
        if(user.isBlocked){
          throw new Error("User Is Blocked!!")
        }
      }
      const ispasswordvalid = await bcrypt.compare(password, user.password);

      if (!ispasswordvalid) {
        throw new Error("PasswordIncorrect");
      }
      //Access Token Generation
      const accessToken = generateAccessToken({
        id: user._id?.toString() || "",
        email: user.email,
        role: "user",
      });
      

      //Refresh Token Generate
      const refreshToken = generateRefreshToken({
        id: user._id?.toString() || "",
        email: user.email,
      });
      return {
        accessToken,
        refreshToken,
        user: {
          id: user._id?.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      };
    } catch (error: any) {
      console.log("Erron in login ", error);
      throw error;
    }
  }

  async generateNewAccessToken(user_refresh_token: string) {
    try {
      const payload = verifyRefreshToken(user_refresh_token);
      let id: string | undefined;
      let email: string | undefined;

      if (payload && typeof payload === "object") {
        id = payload?.id;
        email = payload?.email;
      }
      if (id && email) {
        const role = "user";
        const userNewAccessToken = generateAccessToken({ id, email, role });
        console.log(
          "---->>>created new accessrtoken here check",
          userNewAccessToken
        );
        return userNewAccessToken;
      } else {
        throw new Error("Invalid token payload structure");
      }
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  }

  async googleSignUpUser(decodedToken: JwtPayload): Promise<any> {
    const email = decodedToken.email;
    const name = decodedToken.name;
    const existedemail = await this._userRepository.existingUser(email);
    if (!existedemail) {
      try {
        const newUser = { email, name, password: null };
        const createdUser = await this._userRepository.createUser(newUser);
        return createdUser;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("User creation failed");
      }
    } else {
      return existedemail;
    }
  }
  async forgotpassword(UserEmail: string): Promise<any> {
    try {
      console.log("checccc", UserEmail);

      const userResponse = await this._userRepository.findUserEmail(UserEmail);
      if (!userResponse) {
        console.log("user not already exist", userResponse);
        throw new Error("Invalid email Address");
      }
      const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
      this._OTP = generateOtp;
      console.log("Generated OTP is", this._OTP);

      //send otp to the email:
      const isMailSet = await sendMail("otp", UserEmail, this._OTP);
      if (!isMailSet) {
        throw new Error("Email not sent");
      }

      const OTP_createdTime = new Date();
      this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
      //store OTP IN db
      await this._userRepository.saveOTP(
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
      const response = await this._userRepository.saveResetPassword(
        userData,
        hashedPassword
      );
      console.log("response check in userservice ", response);
      return response;
    } catch (error) {
      console.log("Error is",error)
    }
  }

  async getAllTrainers():Promise<any>{
    
    console.log("ïn service")
    try {
      const trainers=await this._userRepository.getAllTrainers()
      const validTrainers=trainers?.filter((trainer: { isBlocked: boolean; kycStatus: string; })=>trainer.isBlocked===false && trainer.kycStatus==="approved")||[]
      
      return validTrainers
      
    } catch (error) {
      console.log("Fetching Trainers error in service",error)
      
    }

  }
  async getSessionSchedules() {
    try {
      return await this._userRepository.fetchAllSessionSchedules();
    } catch (error) {
      console.log("Error is",error)
    }
  }
  async getTrainer(trainerId: string) {
    try {
      return await this._userRepository.getTrainer(trainerId);
    } catch (error) {
      console.log("error is",error)
    }
  }

  async checkoutPayment(sessionID:string,userId:string) {
try {
 
  const sessionData = await this._userRepository.findSessionDetails(sessionID);

  console.log("sessionData is......",sessionData)
  if (!sessionData || typeof sessionData.price !== "number" ||  !(sessionData.selectedDate || sessionData.startDate) ) {
    throw new Error("Missing or invalid session data");
  }
  const startDate = new Date(sessionData.selectedDate || sessionData.startDate);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid start date");
    }
    const endDate = sessionData.endDate ? new Date(sessionData.endDate) : null;
    if (endDate && isNaN(endDate.getTime())) {
      throw new Error("Invalid end date");
    }
  
  
  const lineItems = [
    {
      price_data: {
        currency: "INR",
        unit_amount: sessionData?.price* 100 ,
        product_data: {
           name: sessionData.type,
          description: sessionData.type
              ? `Description: Session from ${sessionData.startTime} to ${sessionData.endTime} on ${startDate.toLocaleDateString()}`
              : `Description: Session from ${sessionData.startTime} to ${sessionData.endTime} on ${startDate.toLocaleDateString()} to ${endDate?.toLocaleDateString()}`,
          },
      },
       
      quantity: 1,
    },
  ];
 
  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ['card'],
     line_items: lineItems,
    mode: 'payment',
    success_url: `http://localhost:5173/paymentSuccess?session_id=${sessionData._id}&stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5173/paymentFailed`,
  });

  return session
} catch (error) {
  console.log("Error in userservice payment",error)
}
  }

  async findBookingDetails(session_id: string, user_id: string, stripe_session_id: string) {
    console.log("mmmmmmm")
    try {
      const session = await this._userRepository.findSessionDetails(session_id);
      console.log("mmmmmmm,session",session)

      if (session) {
        session.status = "Confirmed";
        await session.save();
      }
      const trainerId = session?.trainerId;
      if (!trainerId) {
        throw new Error("Trainer ID is not available in the session.");
      }
      
      
      const trainer = await this.getTrainer(trainerId.toString());
      const sessionData = await stripeClient.checkout.sessions.retrieve(stripe_session_id)

        if (!trainer || trainer.length === 0) {
        throw new Error("Trainer not found.");
      }
       const bookingDetails: IBooking = {
         sessionId: new mongoose.Types.ObjectId(session._id),
         trainerId: new mongoose.Types.ObjectId(trainer[0]._id),
         userId: new mongoose.Types.ObjectId(user_id),
         // specialization: session.specializationId.name,
         sessionType: session.type,
         bookingDate: new Date(),
         startDate: session.selectedDate || session.startDate,
         endDate: session.endDate,
         startTime: session.startTime,
         endTime: session.endTime,
         amount: session.price,
         paymentStatus: "Confirmed",
         createdAt: new Date(),
         updatedAt: new Date(),
         payment_intent: sessionData.payment_intent ? sessionData.payment_intent.toString() : undefined,
         
       };
      const existingBooking = await this._userRepository.findExistingBooking(bookingDetails);
      if (existingBooking) {
        console.log("Booking already exists.");
        return existingBooking
       // throw new Error("Booking already exists.");
      }
      const bookingData=await this._userRepository.createBooking(bookingDetails)
      await this._userRepository.createNotification(bookingData)

      
      return bookingData

      
    } catch (error) {
      console.log("error in fetching userservice",error)
    }
  }

  async fetchSpecialization(){
    
    try {
      const response=this._userRepository.fetchSpecializations()
      return response
    } catch (error) {
      console.log("Error in fetchingspecializations userservice",error)
    }
  }
  async fechtUserData(userId:string):Promise<User|null>{
    try {
     return  await this._userRepository.fetchUserData(userId) 
    } catch (error) {
      console.log("Error in fetch Data",error)
      return null
    }
  }

  async editUserData(userId:string,userData:User){
    try {
     return  await this._userRepository.editUserData(userId,userData)
    } catch (error) {
      console.log("Error in EditUserData in Service",error)
      
    }
  }
  async getBookedsessionData(userId:string){
    try {
     return  await this._userRepository.getBookedsessionData(userId)
    } catch (error) {
      console.log("Error in fetching user data session ",error)
    }

  }
  async getNotifications(userId: string) {
    try {
      return await this._userRepository.fetchNotifications(userId)
    } catch (error) {
      throw new Error('failed to find notifications')
    }
   }

   async clearNotifications(userId: string) {
    try {
      return await this._userRepository.deleteUserNotifications(userId)
    } catch (error) {
      throw new Error('failed to delete notifications')
    }
   }

   async getDietPlan(trainerId:string,userId:string){
    try {
      return await this._userRepository.fetchDietPlan(trainerId,userId)

    } catch (error) {
      throw new Error('failed to fetch dietplan')

    }

   }
   async cancelAndRefund(bookId:string,userId:string,trainerId:string){
    
    try {
      const bookedsession=await this._userRepository.cancelAndRefund(bookId,userId,trainerId)
      

      //refund all amount into user account
      const refund = await stripeClient.refunds.create({
        payment_intent:   bookedsession.payment_intent,
        amount: bookedsession.Amount
      });
      if (refund.status === 'succeeded') {
        return {
          success: true,
          message: 'Refund processed successfully',
        };
      } else {
        throw new Error('Refund processing failed');
      }
   
  
    } catch (error) {
      console.log("Error cancel and refund",error)
    }

   }
   async findBookings(user_id: string, trainerId: string) {
    try {
      const bookingData = await this._userRepository.findBookings(user_id, trainerId)
      console.log("ccccccccc",bookingData.paymentStatus)
      return bookingData?.paymentStatus
    } catch (error) {
      throw new Error('failed to find booking') 
    }
   }
   
  async addReview(reviewComment: string, selectedRating: number, userId: string, trainerId: string) {
    try {
      return await this._userRepository.createReview(reviewComment, selectedRating, userId, trainerId)
    } catch (error) {
      throw new Error('Failed to create review');
    }
  }
  async getReivewSummary(trainer_id: string) {
    try {      
      const avgReviewsRating = await this._userRepository.getAvgReviewsRating(trainer_id)
      return avgReviewsRating
    } catch (error) {
      throw new Error('failed to find review summary')   
    }
  }
 
  
}

export default UserService;
