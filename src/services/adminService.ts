import AdminRepository from "../repositories/adminRepository"
import UserRepository from "../repositories/userRepository";
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from '../utils/jwtHelper'
import dotenv from "dotenv"
dotenv.config();

class AdminService{
    private adminRepository: AdminRepository;

  constructor(adminRepository: AdminRepository) {

    this.adminRepository = adminRepository;
  }
  async adminLogin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    try {
      if (process.env.ADMIN_EMAIL === email && process.env.ADMIN_PASSWORD === password) {
        console.log("Credentials matched");
  
        let adminData: any = await this.adminRepository.findAdmin(email);
  
        if (!adminData) {
          console.log("Admin does not exist, creating admin...");
          adminData = await this.adminRepository.createAdmin(email, password);
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
  

async generateTokn(admin_refresh_token: string){
try {
  const payload=verifyRefreshToken(admin_refresh_token)
  let id: string | undefined;
  let email: string | undefined;
  if (payload && typeof payload === "object") {
    id = payload?.id;
    email = payload?.email;
  }
  if (id && email) {
    const role = 'admin'
    const AdminNewAccessToken = generateAccessToken({ id, email , role});
    return AdminNewAccessToken;
  } else {
    throw new Error("Invalid token payload structure");
  }

} catch (error) {
  console.error("Error generating token:", error);
  throw error;
}
}


async getAllUsers(){
  return await this.adminRepository.fetchAllUsers()
}

async addSpecialization(specializationData:{name:string,description:string}){
const specialization=await this.adminRepository.saveSpecialization({...specializationData})
return specialization
}
async getAllSpecializations() {
  const specializations = await this.adminRepository.getAllSpecializations()    
  return specializations
}
async updatespecialisation(name:string,description:string,specializationId:string){
  const specializationresponse=await this.adminRepository.saveupdatespecialization(name,description,specializationId)
  return specializationresponse
}

async blockUnblockUser(user_id:string,userState:boolean){
  return await this.adminRepository.blockUnblockUser(user_id,userState)

}
}


export default AdminService