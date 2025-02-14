    //eslint-disable-next-line @typescript-eslint/no-unused-vars

import { LoginAdmin_interface } from "../interface/admin_interface";
import AdminModel from "../models/adminModel";
import UserModel from "../models/userModel";
import SpecializationModel from "../models/specializationModel";
import mongoose from "mongoose";
import KYCModel from "../models/KYC_Models";
import TrainerModel from "../models/trainerModel";
import KycRejectionReasonModel from "../models/kycRejectionReason";
import { IAdminRepository } from "../interface/admin/Admin.repository.interface";
import BaseRepository from "./base/baseRepository";
import { promises } from "dns";
import { IUser } from "../interface/common";
import { IKYC, ISpecialization, ITrainerKYC } from "../interface/trainer_interface";
type IUserDocument = IUser & Document;





class AdminRepository extends BaseRepository<any> implements IAdminRepository {

    private _adminModel = AdminModel;
    private _userModel = UserModel
    private _specializationModel=SpecializationModel
    private _kycModel = KYCModel
    private _trainerModel=TrainerModel
    private _kycRejectionReasonModel = KycRejectionReasonModel

    constructor() {
      super(AdminModel);  // Passing AdminModel to the base class for CRUD operations
    }

    async findAdmin(email:string):Promise<LoginAdmin_interface|undefined|null>{
             try{
              return await AdminModel.findOne({ email });

             }catch(error){
              console.log(error)
            }
     
    }
    async createAdmin(email:string,password:string):Promise<LoginAdmin_interface|null>{
    
       try{
        console.log("creatil ethi");

        let data={email,password}
        
        const newAdmin = new AdminModel(data);
        return await newAdmin.save()
       }catch(error){
        console.log("create admin",error);
        throw error
       }
    }
    async fetchAllUsers():Promise<IUserDocument[] |undefined>{
      try{
        return await this._userModel.find()

      }catch(error){
        console.log("error in fetching all users",error)
      }

    }
    async saveSpecialization({name,description,image}:{name:string,description:string,image:string|null}){
    
         try{
        return await this._specializationModel.create({name,description,image})
    }catch(error:any){
        console.error("Error in admin repository:", error);
      throw new Error(error.message)
    }
}
async getAllSpecializations():Promise<ISpecialization[]|undefined|null> {
  try{
    return await this._specializationModel.find()
  }catch(error){
   console.log("Error in admin repository",error)
  }
    
  }

  async saveupdatespecialization(name:string,description:string,specializationId:string,imageUrl:string){
    try{
     console.log("inew image url reached repo",imageUrl)
     let image=imageUrl
    const updatedSpecialization=await this._specializationModel.findByIdAndUpdate(specializationId,{name,description,image},{new:true})
    return updatedSpecialization
    }catch(error){
        console.log(error)

    }

  }
async blockUnblockUser(user_id:string,userState:boolean):Promise<IUser|undefined|null>{
    try{
      return await this._userModel.findByIdAndUpdate({_id:user_id},{isBlocked:userState},{new:true})

    }catch(error){
      console.log("Error in admin repo",error)
    }

}
async fetchKycData(trainerId:string):Promise<IKYC|undefined|null>{
    console.log("here alsooooooo")
    try {
        const kycData=await this._kycModel.findOne({trainerId}).populate("specializationId").populate("trainerId")
        console.log("final reached///////",kycData)
        return kycData
    } catch (error) {
        console.error('Error fetching KYC data:', error);

        
    }

}

async getAllTrainersKycDatas():Promise<any> {
    return await this._trainerModel.aggregate([
      {
        $lookup: {
          from: this._kycModel.collection.name, 
          localField: '_id', 
          foreignField: 'trainerId', 
          as: 'kycData', 
        },
      },
      {
        $unwind: {
          path: '$kycData', 
          // preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $project: {
          _id: 1,
          name: 1, 
          email: 1, 
          kycData: 1,
        },
      },
    ]);
  }

  async deleteKyc(trainer_id: string) {
    try {
      console.log('-------------------------->',trainer_id);
      
      const result = await this._kycModel.findOneAndDelete({ trainerId: trainer_id });
      if (result) {
        console.log('KYC record deleted successfully:', result);
      } else {
        console.log('No KYC record found for deletion with trainer ID:', trainer_id);
      }
    } catch (error) {
      console.error('Error deleting KYC record:', error);
    }
  }

  async updateKycStatus(status: string, trainer_id: string, rejectionReason: string | null): Promise<any> {
    try {
      console.log('update kyc status repo', rejectionReason);
      
      const updatedTrainer = await this._trainerModel.findByIdAndUpdate(
        trainer_id,
        { kycStatus: status },
        { new: true, runValidators: true }
      );
  
      if (updatedTrainer) {
        console.log('Trainer KYC status updated successfully:', updatedTrainer);
  
        const updatedKyc = await this._kycModel.findOneAndUpdate(
          { trainerId: trainer_id },
          { kycStatus: status },
          { new: true, runValidators: true }
        );
  
        if (updatedKyc) {
          console.log('KYC model status updated successfully:', updatedKyc);
  
          // Save the rejection reason if the status is 'rejected'
          if (status === 'rejected' && rejectionReason) {
           const reason =  await this._kycRejectionReasonModel.create({
              trainerId: trainer_id,
              reason: rejectionReason,
            });
            console.log('Rejection reason saved successfully.');
            const response = {
              trainerMail : updatedTrainer.email,
              reason: reason.reason
            }
            return response
          } 

          if(status === 'approved') {
            console.log('approve hit with',updatedTrainer.email);

            
            
            if(updatedTrainer.email) {
              return updatedTrainer.email
            }
          }
          
  
        } else {
          console.log('KYC record not found for the given trainer ID:', trainer_id);
          return null;
        }
      } else {
        console.log('Trainer not found with the given ID:', trainer_id);
        return null;
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      throw error;
    }
  }
  

}




export default AdminRepository