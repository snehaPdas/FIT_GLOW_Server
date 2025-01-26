import express from "express"
import AdminRepository from "../repositories/adminRepository"
import AdminService from "../services/adminService"
import AdminController from "../controllers/adminController"
import authMiddleware from "../middlewares/authmiddlewares";
import upload from "../utils/multer"



const router=express.Router()

//instance creation
const adminRepositoryInstance=new AdminRepository()
const adminServiceInstance =new AdminService(adminRepositoryInstance)
const adminControllerInstance=new AdminController(adminServiceInstance)

router.post("/loginadmin",adminControllerInstance.adminLogin.bind(adminControllerInstance))
router.get("/users",adminControllerInstance.getAllUsers.bind(adminControllerInstance))

router.post("/specialization",upload.single("image") ,adminControllerInstance.addspecialization.bind(adminControllerInstance))

router.post("/refresh-token",adminControllerInstance.refreshToken.bind(adminControllerInstance))
router.patch("/:user_id/block-unblock",authMiddleware(['admin']), adminControllerInstance.blockUnblockUser.bind(adminControllerInstance))
router.get('/specialization',  adminControllerInstance.getAllSpecializations.bind(adminControllerInstance))
router.put("/specialization/:id",upload.single("image"),adminControllerInstance.updatespecialisation.bind(adminControllerInstance))
router.get('/trainers/kyc', adminControllerInstance.getAllTrainersKycDatas.bind(adminControllerInstance))
router.get('/trainers/kyc/:trainer_id', adminControllerInstance.trainersKycData.bind(adminControllerInstance));
router.patch('/kyc-status-update/:trainer_id', authMiddleware(['admin']), adminControllerInstance.changeKycStatus.bind(adminControllerInstance));


export default router;



