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

 router.get("/trainers",isblocked,authMiddlewares(['user']),userControllerInstance.getAllTrainers.bind(userControllerInstance))
 router.get("/schedules",isblocked,authMiddlewares(['user']),userControllerInstance.getSessionSchedules.bind(userControllerInstance))
 router.get("/trainers/:trainerId", authMiddlewares(['user']),userControllerInstance.getTrainer.bind(userControllerInstance))
 router.post("/payment/:sessionId",isblocked, authMiddlewares(['user']), userControllerInstance.checkoutPayment.bind(userControllerInstance))
 
 router.post("/bookings",authMiddlewares(['user']),userControllerInstance.createBooking.bind(userControllerInstance))
 
 router.get("/specializations",authMiddlewares(['user']),userControllerInstance.fetchAllSpecializations.bind(userControllerInstance))
 router.get('/users/:userId',authMiddlewares(['user']),userControllerInstance.getUser.bind(userControllerInstance))
 router.patch("/users",authMiddlewares(['user']),userControllerInstance.editUserData.bind(userControllerInstance))
 router.get("/booking-details",authMiddlewares(['user']),authMiddlewares(['user']),userControllerInstance.getBookedsessionData.bind(userControllerInstance))


 router.get('/notifications/:user_id', authMiddlewares(['user']), userControllerInstance.getNotifications.bind(userControllerInstance)); 
 router.delete('/clear-notifications/:user_id', authMiddlewares(['user']), userControllerInstance.clearNotifications.bind(userControllerInstance));

 router.get('/dietplan/:trainerId/:userId', authMiddlewares(['user']), userControllerInstance.getDietPlan.bind(userControllerInstance));






console.log('hit routr');


export default router;
