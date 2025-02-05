// import AdminRepository from "../repositories/adminRepository";
// import UserRepository from "../repositories/userRepository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtHelper";
import dotenv from "dotenv";
import sendMail from "../config/email_config";
import { kyTemplate } from "../config/kyTemplate";
import { IAdminService } from "../interface/admin/Admin.service.interface";
// import { IUser } from "../interface/common";
import { IAdminRepository } from "../interface/admin/Admin.repository.interface";

dotenv.config();

class AdminService implements IAdminService {
  private _adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this._adminRepository = adminRepository;
  }
  async adminLogin(email:string,password:string):Promise<any>{
  try {
      if (
        process.env.ADMIN_EMAIL === email &&
        process.env.ADMIN_PASSWORD === password
      ) {
        console.log("Credentials matched");

        let adminData: any = await this._adminRepository.findAdmin(email);

        if (!adminData) {
          console.log("Admin does not exist, creating admin...");
          adminData = await this._adminRepository.createAdmin(email, password);
        }

        // Generate access and refresh tokens
        const accessToken = generateAccessToken({
          id: adminData._id.toString(),
          email: adminData.email,
          role: "admin",
        });
        const refreshToken = generateRefreshToken({
          id: adminData._id.toString(),
          email: adminData.email,
        });

        return {
          accessToken,
          refreshToken,
    
          admin: {
            id: adminData._id.toString(),
            email: adminData.email,
            password: adminData.password,
            
          },
        };
      } else {
        console.log("Invalid admin credentials");
        return {
          status: 401,
         success: false,
          message: "Invalid admin credentials",
        };
      }
    } catch (error) {
      console.error("Error in adminLogin", error);
      throw new Error("Admin login failed. Please try again later.");
    }
  }

  async generateTokn(admin_refresh_token: string) {
    try {
      const payload = verifyRefreshToken(admin_refresh_token);
      let id: string | undefined;
      let email: string | undefined;
      if (payload && typeof payload === "object") {
        id = payload?.id;
        email = payload?.email;
      }
      if (id && email) {
        const role = "admin";
        const AdminNewAccessToken = generateAccessToken({ id, email, role });
        return AdminNewAccessToken;
      } else {
        throw new Error("Invalid token payload structure");
      }
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  }

  async getAllUsers() :Promise<any>{
    try{
      return await this._adminRepository.fetchAllUsers();

    }catch(error){
      console.log("Error in add specialization in service",error )
    }
  }

  async addSpecialization(specializationData: { name: string; description: string;},imageUrl: string | null) :Promise<any>{
    try{
      const specialization = await this._adminRepository.saveSpecialization({
        ...specializationData,image: imageUrl
      });
      return specialization;
    }catch(error:any){
    
      throw new Error(error.message)

      console.log(error)
    }
   
  }  

  async getAllSpecializations():Promise<any> {
    try{
      const specializations = await this._adminRepository.getAllSpecializations();
      return specializations;
    }catch(error){
      console.log(error)
    }
   
  }
  async updatespecialisation(name: string,description: string,specializationId: string, imageUrl:string) :Promise<any>
  
  {
    try{
      console.log("the new image url is.......",imageUrl)
      const specializationresponse =
        await this._adminRepository.saveupdatespecialization(
          name,
          description,
          specializationId,
          imageUrl
        );
      return specializationresponse;
    }catch(error){
      console.log(error)
    }
   
  }

  async blockUnblockUser(user_id: string, userState: boolean):Promise<any> {
    try{
      return await this._adminRepository.blockUnblockUser(user_id, userState);

    }catch(error){
      console.log(error)
    }
  }

  async fetchKycData(trainerId: string):Promise<any>{
    try {
      let response = await this._adminRepository.fetchKycData(trainerId);
      console.log("casual checking", response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async TraienrsKycData():Promise<any> {
    try {
      const allTrainersKycDatas =
        await this._adminRepository.getAllTrainersKycDatas();
      // console.log('allTrainersKycDatas',allTrainersKycDatas);

      return allTrainersKycDatas;
    } catch (error) {
      console.error("Error fetching trainers KYC data:", error);
      throw error;
    }
  }

  async updateKycStatus(
    status: string,
    trainer_id: string,
    rejectionReason: string | null
  ): Promise<void> {
    try {
      const updatedKyc = await this._adminRepository.updateKycStatus(
        status,
        trainer_id,
        rejectionReason
      );
      console.log("simply checkingggg datas", updatedKyc);

      if (status === "approved" || status === "rejected") {
        await this._adminRepository.deleteKyc(trainer_id);
        console.log(`KYC data deleted for trainer ID: ${trainer_id}`);
      }

      if (status === "approved") {
        console.log("simply checkingggg approved", updatedKyc);
        const email_Ht = kyTemplate(
          "your Kyc approved successfully",
          updatedKyc || "user",
          status
        );
        await sendMail("approve", updatedKyc, email_Ht);
      } else {
        console.log("simply checkingggg", updatedKyc.trainerMail);
        const email_Ht = kyTemplate(
          updatedKyc.reason,
          updatedKyc.trainerMai || "user",
          status
        );

        await sendMail("reject", updatedKyc.trainerMail, email_Ht);
      }
    } catch (error) {
      console.error("Error updating KYC status:", error);
    }
  }
}

export default AdminService;
