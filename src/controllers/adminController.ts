import { Request, Response, NextFunction } from "express";
import AdminService from "../services/adminService";
import { LoginAdmin_interface } from "../interface/admin_interface";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

import { jwtDecode } from "jwt-decode";

class AdminController {
  private adminService: AdminService;
  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  async adminLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { email, password }: LoginAdmin_interface = req.body;

      const adminResponse = await this.adminService.adminLogin({
        email,
        password,
      });
      
      if(adminResponse.status===401){
        res.status(401).json({
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
        res.status(200).json({
          message: "Login successful",
          admin: adminResponse.admin,
          token: accessToken,
        });
       
        
       } 
      // else{
      //   res.status(401).json({
      //     message: "Invalid credentials. Login failed.",
      //   });
      // }
      
    } catch (error:any) {
      console.log("admin loggin controller Error", error);
    next(error);
        }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const admin_refresh_token = req.cookies?.admin_refresh_token;

    if (!admin_refresh_token) {
      res.status(403).json({ message: "Refresh token not found" });
      return;
    }

    try {
      const newAccessToken = await this.adminService.generateTokn(
        admin_refresh_token
      );

      const AdminNewAccessToken = Object.assign(
        {},
        { accessToken: newAccessToken }
      );

      // console.log('new token', AdminNewAccessToken);

      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Error generating new access token:", error);
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const allUsers = await this.adminService.getAllUsers();
      res
        .status(200)
        .json({ message: "Fetch All users successfully", users: allUsers });
    } catch (error) {
      console.log(error);
    }
  }
  async addspecialization(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("reached controller")
      const specializationData = req.body;
          
      const specializationresponse = await this.adminService.addSpecialization(specializationData)
      res.status(200).json({ message: "Specialization Added sucessfuly", specializationresponse});
      if (!specializationData) {
        res.status(400).json({ message: "Specialization name is required" });
      }
    } catch (error) {
      console.log("Error adding specialization", error);
    }
  }

  async getAllSpecializations(req: Request, res: Response, next: NextFunction) {
    try {
      const allSpecializations = await this.adminService.getAllSpecializations();

      res.status(200).json(allSpecializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      next(error)
    }
  }

  async updatespecialisation(req: Request, res: Response, next: NextFunction){
    
       try {
        const {name,description}=req.body
          const specializationId=req.params.id
        const response= await this.adminService.updatespecialisation(name,description,specializationId)
     // const specialization={name: response?.name,description: response?.description,}
        console.log("response what",response?.name,response?.description)
        const specialization=response
        res.status(200).json({message:"updatedsuccessfully",specialization})
        
       } catch (error) {
        console.log("the error in controller",error)
       }
  }


  async blockUnblockUser(req: Request, res: Response, next: NextFunction){
    try{
    const user_id=req.params.user_id
    const userState=req.body.status

    const responsestatus=await this.adminService.blockUnblockUser(user_id,userState)
    console.log("response data issssss",responsestatus)
    res.status(200).json({message:"user status updated successfully",data:responsestatus?.isBlocked})
    

    }catch(error){
    console.log("Error in controller userblockunblock ",error)
    }
  }

  
}

export default AdminController;
