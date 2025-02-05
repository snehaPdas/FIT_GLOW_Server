import { Document } from "mongoose";
import { IBooking, IUser } from "../common";
import{Interface_Trainer,IKYC,ISession,ISpecialization,ISessionDetails} from "../trainer_interface"

export interface ITrainerService{
    findAllSpecializations():Promise<ISpecialization[]>
    registerTrainer(trainerData:Interface_Trainer):Promise<any>
    verifyOtp(trainerData:Interface_Trainer,otp:string):Promise<any>
    resendOTP(email:string):Promise<void>
    verifyForgotOTP(userData:string,otp:string):Promise<void>
    LoginTrainer(email:string,password:string):Promise<{
      trainer: any;user:string,accessToken:string,refreshToken:string
}>
    generateNewAccessToken(refresh_token:string):Promise<any>
    forgotpassword(emailData:string):Promise<IUser>
    resetapassword(userData: string, payload: { newPassword: string }):Promise<any>
    kycSubmit(formData: any, files: { [fieldname: string]: Express.Multer.File[] }):Promise<any>
    kycStatus(trainerId:string):Promise<IKYC[]>
    getSpecialization(trainerId:string):Promise<ISpecialization>
    storeSessionData(sessionData:ISession):Promise<ISession>
    getSessionShedules(trainer_id:string):Promise<Interface_Trainer>
    fetchBookingDetails(trainerId:string):Promise<IBooking>
    editStoreSessionData(sessionId:string,sessionData:string):Promise<ISession>
    findTrainer(trainer_id:string):Promise<Interface_Trainer>
    fetchUser(userId:string):Promise<IUser>
}