import  express  from "express";
import UserRepository from "../repositories/userRepository";
import UserService from "../services/userService";
import UserController from "../controllers/userControllers";
import authMiddlewares from "../middlewares/authmiddlewares";
import isblocked from "../middlewares/userAuth"


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

 router.get("/trainers",isblocked,userController.getAllTrainers.bind(userController))
 router.get("/schedules",isblocked,userController.getSessionSchedules.bind(userController))
 router.get("/trainers/:trainerId",isblocked, userController.getTrainer.bind(userController))
 router.post("/payment/:sessionId", authMiddlewares(['user']), userController.checkoutPayment.bind(userController))
 
 router.post("/bookings",userController.createBooking.bind(userController))
 router.get("/specializations",userController.fetchAllSpecializations.bind(userController))




console.log('hit routr');


export default router;
