
import { IUser } from "../common"
import { IOtp } from "../common"
import { IBooking } from "../common";
import mongoose, { Types } from "mongoose";
import { User } from "../../interface/user_interface";


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
    getAllTrainers(trainerId: string):Promise<any>
    fetchAllSessionSchedules():Promise<any>
    getTrainer(trainerId:string):Promise<any>
    findSessionDetails(sessionID:string):Promise<any>
    findExistingBooking(bookingDetails:IBooking):Promise<any>
    createBooking(bookingDetails:IBooking):Promise<any>
    fetchSpecializations():Promise<any>
    fetchUserData(userId:string):Promise<User|null>
    editUserData(userId:string,userData:User):Promise<any>
    getBookedsessionData(userId:string):Promise<any>
}