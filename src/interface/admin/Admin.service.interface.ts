import { promises } from "dns";
import { LoginAdmin_interface,ISpecialization } from "../admin_interface";
import { IUser,IOtp,JwtPayload,IBooking } from "../common";
import { ObjectId } from "mongoose";


export interface IAdminService{
    adminLogin(email:string,password:string):Promise<any>
    generateTokn(admin_refresh_token:string):Promise<string>
    getAllUsers(): Promise<IUser[]>
    addSpecialization(specializationData: { name: string; description: string;},imageUrl: string | null):Promise<any>
    getAllSpecializations():Promise<ISpecialization[]>
    updatespecialisation( name: string,description: string,specializationId: string,imageUrl:string):Promise<void>
    blockUnblockUser(user_id:string,userState:boolean):Promise<IUser>
    fetchKycData(trainerId:string):Promise<IUser>
    TraienrsKycData():Promise<void>
    updateKycStatus(  status: string, trainer_id: string,rejectionReason: string | null):Promise<void>

}