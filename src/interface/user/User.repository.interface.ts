
import { IUser } from "../common"
import { IOtp } from "../common"
import { IBooking } from "../common";
import mongoose, { Types } from "mongoose";
import { User } from "../../interface/user_interface";
import { Interface_Trainer, ISpecialization } from "../trainer_interface";
import { ISession } from "../trainer_interface";


export interface IUserRepository{
    existingUser(email: string):Promise<IUser | null>
    saveOTP(email: string, OTP: string, OTPExpirey: Date):Promise<void>
    getOtpByEmail(email: string):Promise<IOtp[]|[]>
    createNewUser(userData: IUser):Promise<void>
    deleteOtpById(otpId?: mongoose.Types.ObjectId):Promise<void>
    findUser(email: string):Promise<IUser | null>
    createUser(user: {email: string; name: string; password: string | null; }):Promise<any>
    findUserEmail(email: string):Promise<any>
    saveResetPassword(email: string, hashedPassword: string):Promise<any>
    getAllTrainers():Promise<any>
    getAllTrainers(trainerId: string):Promise<Interface_Trainer[]|undefined>
    fetchAllSessionSchedules():Promise<ISession>
    getTrainer(trainerId:string):Promise<any>
    findSessionDetails(sessionID:string):Promise<any>
    findExistingBooking(bookingDetails:IBooking):Promise<any>
    createBooking(bookingDetails:IBooking):Promise<IBooking>
    createNotification(bookingDetails:any):Promise<any>
    fetchSpecializations():Promise<any>
    fetchUserData(userId:string):Promise<User|null>
    editUserData(userId:string,userData:User):Promise<any>
    getBookedsessionData(userId:string):Promise<any>
    fetchNotifications(userId:string):Promise<any>
    deleteUserNotifications(userId:string):Promise<any>
    fetchDietPlan(trainerId:string,userId:string):Promise<any>
}

