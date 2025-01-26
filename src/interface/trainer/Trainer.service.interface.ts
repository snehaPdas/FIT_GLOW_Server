import { Document } from "mongoose";
import { IBooking } from "../common";
import{Interface_Trainer,IKYC,ISession,ISpecialization,ISessionDetails} from "../trainer_interface"

export interface ITrainerService{
    findAllSpecializations():Promise<any>
    registerTrainer(trainerData:Interface_Trainer):Promise<any>
    verifyOtp(trainerData:Interface_Trainer,otp:string):Promise<any>
    resendOTP(email:string):Promise<void>
    verifyForgotOTP(userData:string,otp:string):Promise<void>
    LoginTrainer(email:string,password:string):Promise<{user:string,accessToken:string,refreshToken:string}>
    generateNewAccessToken(refresh_token:string):Promise<any>
    forgotpassword(emailData:string):Promise<any>
    resetapassword(userData: string, payload: { newPassword: string }):Promise<any>
    kycSubmit(formData: any, files: { [fieldname: string]: Express.Multer.File[] }):Promise<any>
    kycStatus(trainerId:string):Promise<any>
    getSpecialization(trainerId:string):Promise<any>
    storeSessionData(sessionData:ISession):Promise<any>
    getSessionShedules(trainer_id:string):Promise<any>
    fetchBookingDetails(trainerId:string):Promise<any>
    editStoreSessionData(sessionId:string,sessionData:string):Promise<any>


}