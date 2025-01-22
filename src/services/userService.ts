// userService.ts
import UserRepository from "../repositories/userRepository";
import sendMail from "../config/email_config";
import { IBooking, IUser } from "../interface/common";
import bcrypt from "bcrypt";
import { JwtPayload } from "../interface/common";
import { generateAccessToken } from "../utils/jwtHelper";
import { generateRefreshToken } from "../utils/jwtHelper";
import { verifyRefreshToken } from "../utils/jwtHelper"
import stripeClient from "../config/stripeClients";
import mongoose from "mongoose";
import stripe from "stripe";

class UserService {
  private userRepository: UserRepository;
  private OTP: string | null = null;
  private expiryOTP_time: Date | null = null;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  // Register user and send OTP
  async register(userData: IUser): Promise<void> {
    console.log("in service")
    try {
      const existedUser = await this.userRepository.existingUser(userData.email)
      console.log("in service....",)

      if (existedUser) {
        console.log("user already exist", existedUser);
        throw new Error("Email Already Exists");
      }
      const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
      this.OTP = generateOtp;
      console.log("Generated OTP is", this.OTP);

      //send otp to the email:
      const isMailSet = await sendMail("otp", userData.email, this.OTP);
      if (!isMailSet) {
        throw new Error("Email not sent");
      }

      const OTP_createdTime = new Date();
      this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
      //store OTP IN db
      await this.userRepository.saveOTP(
        userData.email,
        this.OTP,
        this.expiryOTP_time
      );
      console.log(`OTP will expire at: ${this.expiryOTP_time}`);
    } catch (error) {
      console.error("error in service:", (error as Error).message);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(userData: IUser, otp: string): Promise<void> {
  try {
      const validateOtp = await this.userRepository.getOtpByEmail(
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
          await this.userRepository.createNewUser(newUserData);
          console.log("User successfully stored.");
          await this.userRepository.deleteOtpById(latestOtp._id);
        } else {
          console.log("OTP has expired");
          await this.userRepository.deleteOtpById(latestOtp._id);
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
      const validateOtp = await this.userRepository.getOtpByEmail(userData);
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

          await this.userRepository.deleteOtpById(latestOtp._id);
        } else {
          console.log("OTP has expired");
          await this.userRepository.deleteOtpById(latestOtp._id);
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
      await this.userRepository.saveOTP(useremail, generateOtp, expireyTime);
      this.OTP=generateOtp
      console.log("new generateOtp is:", generateOtp);
      

      const isMailSent = await sendMail("otp", useremail, this.OTP);
      if (!isMailSent) {
        throw new Error("Email not sent");
      }
      console.log(`otp:::Resent OTP ${this.OTP} to ${useremail}`);
     
    } catch (error) {
      console.error("Error in resend otp:", error);
    }
  }

  async LoginUser(email: string, password: string): Promise<any> {
    try {
      const user: IUser | null = await this.userRepository.findUser(email);
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
    let existedemail = await this.userRepository.existingUser(email);
    if (!existedemail) {
      try {
        const newUser = { email, name, password: null };
        const createdUser = await this.userRepository.createUser(newUser);
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

      const userResponse = await this.userRepository.findUserEmail(UserEmail);
      if (!userResponse) {
        console.log("user not already exist", userResponse);
        throw new Error("Invalid email Address");
      }
      const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
      this.OTP = generateOtp;
      console.log("Generated OTP is", this.OTP);

      //send otp to the email:
      const isMailSet = await sendMail("otp", UserEmail, this.OTP);
      if (!isMailSet) {
        throw new Error("Email not sent");
      }

      const OTP_createdTime = new Date();
      this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
      //store OTP IN db
      await this.userRepository.saveOTP(
        UserEmail,
        this.OTP,
        this.expiryOTP_time
      );
      console.log(`OTP will expire at: ${this.expiryOTP_time}`);

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
      const response = await this.userRepository.saveResetPassword(
        userData,
        hashedPassword
      );
      console.log("response check in userservice ", response);
      return response;
    } catch (error) {}
  }

  async getAllTrainers(){
    
    console.log("ïn service")
    try {
      const trainers=await this.userRepository.getAllTrainers()
      const validTrainers=trainers?.filter((trainer)=>trainer.isBlocked===false && trainer.kycStatus==="approved")||[]
      
      return validTrainers
      
    } catch (error) {
      console.log("Fetching Trainers error in service",error)
      
    }

  }
  async getSessionSchedules() {
    try {
      return await this.userRepository.fetchAllSessionSchedules();
    } catch (error) {}
  }
  async getTrainer(trainerId: string) {
    try {
      return await this.userRepository.getTrainer(trainerId);
    } catch (error) {}
  }

  async checkoutPayment(sessionID:string,userId:string) {
try {
 
  const sessionData = await this.userRepository.findSessionDetails(sessionID);

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
          name: "TrainerName",
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
    try {
      const session = await this.userRepository.findSessionDetails(session_id);

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
        sessionType: session.type ,
        bookingDate: new Date(),
        startDate: session.selectedDate || session.startDate,
        endDate: session.endDate,
        startTime: session.startTime,
        endTime: session.endTime,
        amount: session.price,
        paymentStatus: "Confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
        payment_intent: sessionData.payment_intent ? sessionData.payment_intent.toString() : undefined
      };
      const existingBooking = await this.userRepository.findExistingBooking(bookingDetails);
      if (existingBooking) {
        console.log("Booking already exists.");
        throw new Error("Booking already exists.");
      }
      const bookingData=await this.userRepository.createBooking(bookingDetails)
      
    } catch (error) {
      console.log("error in fetching userservice",error)
    }
  }

  async fetchSpecialization(){
    
    try {
      const response=this.userRepository.fetchSpecializations()
      return response
    } catch (error) {
      console.log("Error in fetchingspecializations userservice",error)
    }
  }
}

export default UserService;
