import  express  from "express";
import UserRepository from "../repositories/userRepository";
import UserService from "../services/userService";
import UserController from "../controllers/userControllers";
import authMiddlewares from "../middlewares/authmiddlewares";


const router=express.Router()

// Set up instances of the repository, service, and controller
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);


 router.post("/signup",userController.register.bind(userController))
 router.post("/otp",userController.verifyOtp.bind(userController))
 router.post("/forgototp",userController.verifyForgotOtp.bind(userController))
 router.post("/loginuser",userController.loginUser.bind(userController))
 router.post("/googlesignup",userController.googleSignUpUser.bind(userController))
 router.post("/resendotp",userController.resendOtp.bind(userController))
 router.post("/refresh-token",userController.refreshToken.bind(userController))
 router.post("/forgotpassword",userController.forgotpassword.bind(userController))
 router.post("/resetpassword",userController.resetPassword.bind(userController))


console.log('hit routr');


export default router;
