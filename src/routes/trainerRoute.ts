import express from 'express';
import upload from "../utils/multer"

import TrainerController from "../controllers/trainerController";
import TrainerService from '../services/trainerService';
import TrainerRepository from "../repositories/trainerRepository";
import AdminController from '../controllers/adminController';
import UserController from '../controllers/userControllers';
// import UserController from '../controllers/userController';
import authMiddlewares from "../middlewares/authmiddlewares";


const router = express.Router();


const trainerRepository = new TrainerRepository();
const trainerService = new TrainerService(trainerRepository);
const trainerController = new TrainerController(trainerService);


const uploadTrainerDataFiles = upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'adhar', maxCount: 1 },  
    { name: 'adharback', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]);


router.post('/signup', trainerController.registerTrainer.bind(trainerController))
router.get('/specializations', trainerController.getAllSpecializations.bind(trainerController));
router.post("/otp",trainerController.verifyOtp.bind(trainerController))
router.post('/resend-otp', trainerController.resendOtp.bind(trainerController))
router.post("/logintrainer",trainerController.loginTrainer.bind(trainerController))
router.post("/refresh-token",trainerController.refreshToken.bind(trainerController))
router.post("/forgotpassword",trainerController.forgotpassword.bind(trainerController))
router.post("/forgototp",trainerController.verifyForgotOtp.bind(trainerController))
router.post("/resetpassword",trainerController.resetPassword.bind(trainerController))
router.post("/trainers/kyc",uploadTrainerDataFiles,trainerController.kycSubmission.bind(trainerController))
router.get('/kycStatus/:trainerId', trainerController.trainerKycStatus.bind(trainerController));
router.get("/specializations/:trainerId",trainerController.getSpecialization.bind(trainerController))

router.post('/session/:trainerId', trainerController.storeSessionData.bind(trainerController))
router.get('/shedules/:trainerId', trainerController.getSessionSchedules.bind(trainerController))









export default router;
