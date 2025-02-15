import { Interface_Trainer } from "../trainer_interface"
import  {IOtp} from "../common"
import { ISession } from "../trainer_interface";
import mongoose, { Types } from "mongoose";


export interface ITrainerRepository{
    findAllSpecializations():Promise<any>
    existsTrainer(trainerData: Interface_Trainer):Promise<any>
    saveOtp(email: string, OTP: string, OTPExpirey: Date):Promise<void>
    getOtpByEmail(email: string):Promise<IOtp[] | []>
    createNewUser(trainerData: Interface_Trainer):Promise<any>
    deleteOtpById(otpId?: mongoose.Types.ObjectId):Promise<any>
    saveOTP(email: string, OTP: string, OTPExpiry: Date):Promise<void>
    findTrainer(email: string):Promise<Interface_Trainer | null>
    findUserEmail(email: string):Promise<any>
    saveResetPassword(email: string, hashedPassword: string):Promise<any>
    saveKyc(formData: any, documents: any):Promise<any>
    changeKycStatus(trainerId: string, profileImage: string | undefined):Promise<string | undefined>
    getTrainerStatus(trainerId: string):Promise<any>
    getSpecialization(trainerid:string):Promise<any>
    createNewSession(sessiondata: ISession):Promise<any>
    fetchSessionData(trainer_id: string):Promise<any>
    fecthBookingDetails(trainerId: string):Promise<any>
    editStoreSessionData(sessionId:string,sessionData:any):Promise<any>
    fetchTrainer(trainer_id:string):Promise<any>
    fetchUeserDetails(userId:string):Promise<any>
    fetchNotifications(trainerId:any):Promise<any>
    deleteTrainerNotifications(trainerId:any):Promise<any>
    fetchWalletData(trainer_id:any):Promise<any>
    withdrawMoney(trainer_id:any,amount:any):Promise<any>
     getAllStatistics():Promise<any>
}