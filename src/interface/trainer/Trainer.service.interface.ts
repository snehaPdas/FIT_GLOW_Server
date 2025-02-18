import { Document } from "mongoose";
import { IBooking, IUser } from "../common";
import{Interface_Trainer,IKYC,ISession,ISpecialization,ISessionDetails,IWallet,IDietPlan} from "../trainer_interface"

export interface ITrainerService{
    findAllSpecializations():Promise<any>
    registerTrainer(trainerData:Interface_Trainer):Promise<void>
    verifyOtp(trainerData:Interface_Trainer,otp:string):Promise<void>
    resendOTP(email:string):Promise<void>
    verifyForgotOTP(userData:string,otp:string):Promise<void>
    LoginTrainer(email:string,password:string):Promise<{trainer: any;user:string,accessToken:string,refreshToken:string}>
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
    getNotifications(trainer_id:any):Promise<any>
    clearNotifications(trainer_id:any):Promise<any>
    getWallet(trinerId:any):Promise<IWallet|null|undefined>
    withdraw(trainer_id:any,amount:any):Promise<IWallet|null|undefined>
     getDashboardData():Promise<void>
     dietPlan(userId:string,dietPlans:IDietPlan):Promise<IDietPlan|undefined>
     getDietPlan(userId:string):Promise<any>
     fetchTrainer(trainder_Id:string):Promise<any>
     updateTrainer(trainer_id:string,updatedTrainerData:any):Promise<any>
}