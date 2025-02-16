
import { IUser } from "../common"
import { JwtPayload } from "../common"
import {User} from "../../interface/user_interface"

export interface IUserService{
    register(userData:IUser):Promise<any>
    verifyOTP(userData:IUser,otp:string):Promise<void>
    verifyForgotOTP(userData: string, otp: string):Promise<void>
    ResendOtp(useremail: string):Promise<void>
    LoginUser(email: string, password: string):Promise<any>
    generateNewAccessToken(user_refresh_token: string):Promise<any>
    googleSignUpUser(decodedToken: JwtPayload):Promise<any>
    forgotpassword(emailData:string):Promise<any>
    resetapassword(userData: string, payload: { newPassword: string} ):Promise<any>
    getAllTrainers():Promise<any>
    getSessionSchedules():Promise<any>
    getTrainer(trainerId:string):Promise<any>
    checkoutPayment(sessionID:string,userId:string):Promise<any>
    findBookingDetails(session_id: string, user_id: string, stripe_session_id: string):Promise<any>
    fetchSpecialization():Promise<any>
    fechtUserData(userId:string):Promise<User|null>
    editUserData(userId:string,userData:User):Promise<any>
    getBookedsessionData(userId:string|undefined):Promise<any>
    getNotifications(user_id:any):Promise<any>
    clearNotifications(user_id:any):Promise<any>
    getDietPlan(trainerId:string,userId:string):Promise<any>


}