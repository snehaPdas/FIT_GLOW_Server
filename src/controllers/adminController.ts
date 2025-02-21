import { Request, Response, NextFunction } from "express";

//import AdminService from "../services/adminService"

import { LoginAdmin_interface } from "../interface/admin_interface";
import multer from "multer";
import { uploadToCloudinary } from "../config/clodinary";
import HTTP_statusCode from "../enums/httpStatusCode";
import responseHelper from "../utils/responseHelper";
import { IAdminService } from "../interface/admin/Admin.service.interface";

const storage = multer.memoryStorage();
const upload = multer({ storage });



class AdminController {

  private _adminService: IAdminService;

  constructor(adminServiceInstance: IAdminService) {
    this._adminService = adminServiceInstance;
  }

  async adminLogin( req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password }: LoginAdmin_interface = req.  body;

      const adminResponse = await this._adminService.adminLogin(email,password,);
      
      if(adminResponse.status===HTTP_statusCode.Unauthorized){
        res.status(HTTP_statusCode.Unauthorized).json({
          message: "Invalid credentials. Login failed.",
        });
      }

      if (adminResponse) {
        const { accessToken, refreshToken } = adminResponse;
        res.cookie("admin_refresh_token", refreshToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(HTTP_statusCode.OK).json({
          message: "Login successful",
          admin: adminResponse.admin,
          token: accessToken,
        });
       
        
       } 
      
      
    } catch (error:any) {
      console.log("admin loggin controller Error", error);
    next(error);
        }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const admin_refresh_token = req.cookies?.admin_refresh_token;

    if (!admin_refresh_token) {
      res.status(HTTP_statusCode.NoAccess).json({ message: "Refresh token not found" });
      return;
    }

    try {
      const newAccessToken = await this._adminService.generateTokn(
        admin_refresh_token
      );

      const AdminNewAccessToken = Object.assign(
        {},
        { accessToken: newAccessToken }
      );

    

      res.status(HTTP_statusCode.OK).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Error generating new access token:", error);
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction):Promise<void> {
    try {
      const allUsers = await this._adminService.getAllUsers();
      res
        .status(HTTP_statusCode.OK)
        
        .json(responseHelper.successResponse("Fetch All users successfully",{users:allUsers}))
    } catch (error) {
      console.log(error);
    }
  }
  async addspecialization(req: Request, res: Response, next: NextFunction):Promise<void> {
    try {
      console.log("reached controller")
      const specializationData = req.body;
      const imageFile = req.file;
      let imageUrl: string | null = null;
         
      if (imageFile) {
        const result:any = await uploadToCloudinary(imageFile.buffer, 'specializationImage');
        imageUrl = result.secure_url;
      }
          console.log("specializationData",specializationData)
      const specializationresponse = await this._adminService.addSpecialization(specializationData,imageUrl)
      res.status(HTTP_statusCode.OK).json({ message: "Specialization Added sucessfuly", specializationresponse});
      if (!specializationData) {
        res.status(HTTP_statusCode.BadRequest).json({ message: "Specialization name is required" });
      }
    } catch (error:any) {
      res.status(400).json({ success: false, message: error.message });
      next(error)
      console.log("Error adding specialization", error);
    }
  }

  async getAllSpecializations(req: Request, res: Response, next: NextFunction) {
    try {
      const allSpecializations = await this._adminService.getAllSpecializations();

      res.status(HTTP_statusCode.OK)
      
      .json(responseHelper.successResponse("fetch specialization successfully",allSpecializations))
    } catch (error) {
      console.error('Error fetching specializations:', error);
      next(error)
    }
  }

  async updatespecialisation(req: Request, res: Response, next: NextFunction){
    
       try {
       
      
        const {name,description}=req.body
          const specializationId=req.params.id
          const imageFile = req.file;
          let imageUrl: string = "";

             
          if (imageFile) {
            const result:any = await uploadToCloudinary(imageFile.buffer, 'specializationImages');
            imageUrl = result.secure_url;
            

          }
          

        const response= await this._adminService.updatespecialisation(name,description,specializationId,imageUrl)
     
        
        const specialization=response
        res.status(HTTP_statusCode.OK).json({message:"updatedsuccessfully",specialization})
        
       } catch (error) {
        next(error)
        console.log("the error in controller",error)
       }
  }


  async blockUnblockUser(req: Request, res: Response, next: NextFunction){
    try{
    const user_id=req.params.user_id
    const userState=req.body.status

    const responsestatus=await this._adminService.blockUnblockUser(user_id,userState)
    
    res.status(HTTP_statusCode.OK).json({message:"user status updated successfully",data:responsestatus?.isBlocked})
    

    }catch(error){
    console.log("Error in controller userblockunblock ",error)
    next(error)

    }
  }

  async trainersKycData(req: Request, res: Response, next: NextFunction):Promise<any>{
    try {
      const trainerId = req.params.trainer_id;
      const trainerKycDetails = await this._adminService.fetchKycData(trainerId);
      
      return res.json({ kycData: trainerKycDetails });


    } catch (error) {
      console.log("error in controller",error)
      next(error)

    }

  }
  async getAllTrainersKycDatas(req: Request, res: Response, next: NextFunction) {
    try {

      const allTrainersKycData = await this._adminService.TraienrsKycData();
      

      res.status(HTTP_statusCode.OK).json({ message: "Trainers KYC data fetched successfully", data: allTrainersKycData });
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      next(error)
    }
  }

  
  async changeKycStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = String(req.body.status);
      const trainer_id = req.params.trainer_id;
      const rejectionReason = req.body.rejectionReason || null;

      await this._adminService.updateKycStatus(status, trainer_id, rejectionReason);

      res.status(HTTP_statusCode.OK).json({ message: 'Trainer status updated successfully', status });
    } catch (error) {
      console.error('Error updating trainer status:', error);
      next(error)
    }
  }

  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this._adminService.getDashboardData()
      res.status(200).json({data: response})
    } catch (error) {
      next(error)
    }
  } 
  
}

export default AdminController;
