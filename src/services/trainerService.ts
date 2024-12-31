import TrainerRepository from "../repositories/trainerRepository";
import { Interface_Trainer } from "../interface/trainer_interface";
import sendMail from "../config/email_config";
import { otpEmailTemplate } from "../config/otpTemplate";
import bcrypt from "bcrypt"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtHelper";
import { uploadToCloudinary } from "../config/clodinary";



class TrainerService {
    private trainerRepository: TrainerRepository;
    private OTP: string | null = null;
    private expiryOTP_time:Date | null=null


    constructor(trainerRepository: TrainerRepository) {
        this.trainerRepository = trainerRepository;
      }
      async findAllSpecializations() {
        try {
          return await this.trainerRepository.findAllSpecializations();
        } catch (error) {
          console.error("Error in service while fetching specializations:", error);
          throw error;
        }
      }
      async registerTrainer(trainerData: Interface_Trainer) {
        console.log("trainer data is",trainerData)
        try {

          const existingTrainer = await this.trainerRepository.existsTrainer(trainerData);
          console.log("existingTrainer",existingTrainer)
          if(existingTrainer){
            throw new Error("Email already exist")
          }
          const generateOtp=Math.floor(1000+ Math.random()*9000).toString()
           this.OTP=generateOtp
           console.log("the otp is:...",this.OTP)
           const email_Ht=otpEmailTemplate(this.OTP,trainerData.name||"user")
           const sentEmail=await sendMail(" your otp for Registration is: ",trainerData.email,email_Ht)
           if(!sentEmail){throw new Error("Email not sent")}
           const OTP_createdTime=new Date()
           this.expiryOTP_time=new Date(OTP_createdTime.getTime()+1*60*1000)


          await this.trainerRepository.saveOtp(trainerData.email,this.OTP,this.expiryOTP_time)
            
        } catch (error) {
          console.error("Error in service:", );
          throw new Error("Error in Trainer service");
        }
      }


      async verifyOtp(trainerData:Interface_Trainer,otp:string){
        console.log("11111111111111",trainerData)

        try {
          const validateOtp=await this.trainerRepository.getOtpByEmail(trainerData.email)
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
                   
                    
                    const hashedPassword = await bcrypt.hash(trainerData.password, 10);
                    
                    const newUserData = { ...trainerData, password: hashedPassword };
                    await this.trainerRepository.createNewUser(newUserData);
                    console.log("User successfully stored.");
                    await this.trainerRepository.deleteOtpById(latestOtp._id);
                  } else {
                    console.log("OTP has expired");
                    await this.trainerRepository.deleteOtpById(latestOtp._id);
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
          this.OTP = generatedOTP;
    
          const OTP_createdTime = new Date();
          this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
    
          await this.trainerRepository.saveOTP(
            email,
            this.OTP,
            this.expiryOTP_time
          );
    
          const email_Ht=otpEmailTemplate(this.OTP,email||"user")
           const sentEmail=await sendMail(" your otp for Registration is: ",email,email_Ht)
           if(!sentEmail){throw new Error("Email not sent")}
    
          console.log(`Resent OTP ${this.OTP} to ${email}`);
        } catch (error) {
          console.error("Error in resendOTP:", (error as Error).message);
          throw error;
        }
      }

      async verifyForgotOTP(userData: string, otp: string): Promise<void> {
        console.log("11111111111111111111111111111111",userData)
        try {
          const validateOtp = await this.trainerRepository.getOtpByEmail(userData);
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
              
    
              await this.trainerRepository.deleteOtpById(latestOtp._id);
            } else {
              console.log("OTP has expired");
              await this.trainerRepository.deleteOtpById(latestOtp._id);
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
          const trainer:Interface_Trainer|null=await this.trainerRepository.findTrainer(email)
      
          if (!trainer) {
            console.log("User not found")
            throw new Error("Usernotfound")
          }
          const ispasswordvalid=await bcrypt.compare(password,trainer.password)
      
          if(!ispasswordvalid){
            throw new Error("PasswordIncorrect")
          }
          //Access Token Generation
         const accessToken=generateAccessToken({id:trainer._id?.toString() || "",email:trainer.email,role:"user"})
         
         
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
              const role = 'user'
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
    
          const userResponse = await this.trainerRepository.findUserEmail(UserEmail);
          if (!userResponse) {
            console.log("user not already exist", userResponse);
            throw new Error("Invalid email Address");
          }
          const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
          this.OTP = generateOtp;
          console.log("Trainer Generated OTP is", this.OTP);
    
          //send otp to the email:
          const isMailSet = await sendMail("otp", UserEmail, this.OTP);
          if (!isMailSet) {
            throw new Error("Email not sent");
          }
    
          const OTP_createdTime = new Date();
          this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
          //store OTP IN db
          await this.trainerRepository.saveOtp(
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
            const response = await this.trainerRepository.saveResetPassword(
              userData,
              hashedPassword
            );
            console.log("response check in userservice ", response);
            return response;
          } catch (error) {}
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
             await this.trainerRepository.saveKyc(formData, documents);
           
        
            // Change KYC status in the repository
            return await this.trainerRepository.changeKycStatus(
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
            const kycStatus = await this.trainerRepository.getTrainerStatus(trainerId)
            return kycStatus;
          } catch (error) {
            console.error("Error in kycStatus service:", error);
            throw new Error("Failed to retrieve KYC status");
          }
        }
        
        
      

}





export default TrainerService;
