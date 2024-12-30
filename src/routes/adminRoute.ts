import express from "express"
import AdminRepository from "../repositories/adminRepository"
import AdminService from "../services/adminService"
import AdminController from "../controllers/adminController"

const router=express.Router()

//instance creation
const adminRepository=new AdminRepository()
const adminService =new AdminService(adminRepository)
const adminController=new AdminController(adminService)

router.post("/loginadmin",adminController.adminLogin.bind(adminController))
router.get("/users",adminController.getAllUsers.bind(adminController))
router.post("/specialization",adminController.addspecialization.bind(adminController))
router.post("/refresh-token",adminController.refreshToken.bind(adminController))
router.patch("/:user_id/block-unblock",adminController.blockUnblockUser.bind(adminController))
router.get('/specialization',  adminController.getAllSpecializations.bind(adminController))
router.put("/specialization/:id",adminController.updatespecialisation.bind(adminController))





export default router;


