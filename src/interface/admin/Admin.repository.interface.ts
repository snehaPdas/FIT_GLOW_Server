import {  LoginAdmin_interface } from "../admin_interface"
import { IUser } from "../../interface/common";
import { IKYC, ITrainerKYC } from "../trainer_interface";
import {ISpecialization} from "../../interface/trainer_interface"

type IUserDocument = IUser & Document;



export interface IAdminRepository{
    findAdmin(email:string):Promise<LoginAdmin_interface|undefined|null>
    createAdmin(email:string,password:string):Promise<LoginAdmin_interface|null>
    fetchAllUsers():Promise<IUserDocument[] |undefined>
    saveSpecialization({name,description,image}:{name:string,description:string,image:string|null}):Promise<any>
    getAllSpecializations():Promise<ISpecialization[]|undefined|null>
    saveupdatespecialization(name:string,description:string,specializationId:string,imageUrl:string):Promise<any>
    blockUnblockUser(user_id:string,userState:boolean):Promise<IUser|undefined|null>
    fetchKycData(trainerId:string):Promise<IKYC|undefined|null>
    getAllTrainersKycDatas():Promise<ITrainerKYC>
    updateKycStatus(status: string, trainer_id: string, rejectionReason: string | null):Promise<any>
    deleteKyc(trainer_id: string):Promise<void>
    getAllStatistics():Promise<any>
}