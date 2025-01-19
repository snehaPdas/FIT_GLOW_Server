import express from "express"
import AdminRepository from "../repositories/adminRepository"
import AdminService from "../services/adminService"
import AdminController from "../controllers/adminController"
import authMiddleware from "../middlewares/authmiddlewares";
import upload from "../utils/multer"



const router=express.Router()

//instance creation
const adminRepository=new AdminRepository()
const adminService =new AdminService(adminRepository)
const adminController=new AdminController(adminService)

router.post("/loginadmin",adminController.adminLogin.bind(adminController))
router.get("/users",adminController.getAllUsers.bind(adminController))

router.post("/specialization",upload.single("image") ,adminController.addspecialization.bind(adminController))

router.post("/refresh-token",adminController.refreshToken.bind(adminController))
router.patch("/:user_id/block-unblock",authMiddleware(['admin']), adminController.blockUnblockUser.bind(adminController))
router.get('/specialization',  adminController.getAllSpecializations.bind(adminController))
router.put("/specialization/:id",adminController.updatespecialisation.bind(adminController))
router.get('/trainers/kyc', adminController.getAllTrainersKycDatas.bind(adminController))
router.get('/trainers/kyc/:trainer_id', adminController.trainersKycData.bind(adminController));
router.patch('/kyc-status-update/:trainer_id', authMiddleware(['admin']), adminController.changeKycStatus.bind(adminController));


export default router;



