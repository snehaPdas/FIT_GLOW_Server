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


const trainerRepositoryInstance = new TrainerRepository();
const trainerServiceInstance = new TrainerService(trainerRepositoryInstance);
const trainerControllerInstance = new TrainerController(trainerServiceInstance);


const uploadTrainerDataFiles = upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'adhar', maxCount: 1 },   
    { name: 'adharback', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]);


router.post('/signup',trainerControllerInstance.registerTrainer.bind(trainerControllerInstance))
router.get('/specializations',trainerControllerInstance.getAllSpecializations.bind(trainerControllerInstance));
router.post("/otp",trainerControllerInstance.verifyOtp.bind(trainerControllerInstance))
router.post('/resend-otp', trainerControllerInstance.resendOtp.bind(trainerControllerInstance))
router.post("/logintrainer",trainerControllerInstance.loginTrainer.bind(trainerControllerInstance))
router.post("/refresh-token",trainerControllerInstance.refreshToken.bind(trainerControllerInstance))
router.post("/forgotpassword",trainerControllerInstance.forgotpassword.bind(trainerControllerInstance))
router.post("/forgototp",trainerControllerInstance.verifyForgotOtp.bind(trainerControllerInstance))
router.post("/resetpassword",trainerControllerInstance.resetPassword.bind(trainerControllerInstance))
router.post("/trainers/kyc",authMiddlewares(['trainer']),uploadTrainerDataFiles,trainerControllerInstance.kycSubmission.bind(trainerControllerInstance))
router.get('/kycStatus/:trainerId',authMiddlewares(['trainer']), trainerControllerInstance.trainerKycStatus.bind(trainerControllerInstance));
router.get("/specializations/:trainerId",authMiddlewares(['trainer']),trainerControllerInstance.getSpecialization.bind(trainerControllerInstance))

router.post('/session/:trainerId',authMiddlewares(['trainer']),trainerControllerInstance.storeSessionData.bind(trainerControllerInstance))
router.put('/edit-session/:sessionId',authMiddlewares(['trainer']), trainerControllerInstance.editStoreSessionData.bind(trainerControllerInstance))

router.get('/shedules/:trainerId',authMiddlewares(['trainer']), trainerControllerInstance.getSessionSchedules.bind(trainerControllerInstance))
router.get(`/bookingdetails/:trainerId`,authMiddlewares(['trainer']),trainerControllerInstance.fetchbookingDetails.bind(trainerControllerInstance))
router.get('/:trainerId', authMiddlewares(['trainer']),trainerControllerInstance.getTrainer.bind(trainerControllerInstance))
router.get('/users/:userId', authMiddlewares(['trainer']),trainerControllerInstance.fetchUser.bind(trainerControllerInstance))

router.get('/notifications/:trainer_id', authMiddlewares(['trainer']), trainerControllerInstance.getNotifications.bind(trainerControllerInstance));
router.delete('/clear-notifications/:trainer_id', authMiddlewares(['trainer']), trainerControllerInstance.clearNotifications.bind(trainerControllerInstance));

router.get('/wallet-data/:trainer_id', authMiddlewares(['trainer']), trainerControllerInstance.getWalletData.bind(trainerControllerInstance));

router.post('/withdraw/:trainer_id', authMiddlewares(['trainer']), trainerControllerInstance.withdraw.bind(trainerControllerInstance));

router.get('/dashboard/:trainer_id', authMiddlewares(['trainer']),trainerControllerInstance.getDashboardData.bind(trainerControllerInstance));

 router.post('/store-diet-plan/:userId', authMiddlewares(['trainer']),trainerControllerInstance.dietPlan.bind(trainerControllerInstance));

 router.get('/get-diet-plan/:userId', authMiddlewares(['trainer']), trainerControllerInstance.getDietPlan.bind(trainerControllerInstance));
 router.put('/update-trainer/:trainer_id', authMiddlewares(['trainer']), upload.single('profileImage'), trainerControllerInstance.updateTrainer.bind(trainerControllerInstance));







export default router;
