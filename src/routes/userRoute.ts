import  express  from "express";
import UserRepository from "../repositories/userRepository";
import UserService from "../services/userService";
import UserController from "../controllers/userControllers";
import authMiddlewares from "../middlewares/authmiddlewares";
import isblocked from "../middlewares/userAuth"


const router=express.Router()

// Set up instances of the repository, service, and controller
const userRepositoryInstance = new UserRepository();
const userServiceInstance = new UserService(userRepositoryInstance);
const userControllerInstance = new UserController(userServiceInstance);


 router.post("/signup",userControllerInstance.register.bind(userControllerInstance))
 router.post("/otp",userControllerInstance.verifyOtp.bind(userControllerInstance))
 router.post("/forgototp",userControllerInstance.verifyForgotOtp.bind(userControllerInstance))
 router.post("/loginuser",userControllerInstance.loginUser.bind(userControllerInstance))
 router.post("/googlesignup",userControllerInstance.googleSignUpUser.bind(userControllerInstance))
 router.post("/resendotp",userControllerInstance.resendOtp.bind(userControllerInstance))
 router.post("/refresh-token",userControllerInstance.refreshToken.bind(userControllerInstance))
 router.post("/forgotpassword",userControllerInstance.forgotpassword.bind(userControllerInstance))
 router.post("/resetpassword",userControllerInstance.resetPassword.bind(userControllerInstance))

 router.get("/trainers",isblocked,userControllerInstance.getAllTrainers.bind(userControllerInstance))
 router.get("/schedules",isblocked,userControllerInstance.getSessionSchedules.bind(userControllerInstance))
 router.get("/trainers/:trainerId", userControllerInstance.getTrainer.bind(userControllerInstance))
 router.post("/payment/:sessionId",isblocked, authMiddlewares(['user']), userControllerInstance.checkoutPayment.bind(userControllerInstance))
 
 router.post("/bookings",userControllerInstance.createBooking.bind(userControllerInstance))
 router.get("/specializations",userControllerInstance.fetchAllSpecializations.bind(userControllerInstance))
 router.get('/users/:userId',userControllerInstance.getUser.bind(userControllerInstance))
 router.patch("/users",userControllerInstance.editUserData.bind(userControllerInstance))
 router.get("/booking-details",authMiddlewares(['user']),userControllerInstance.getBookedsessionData.bind(userControllerInstance))







console.log('hit routr');


export default router;
