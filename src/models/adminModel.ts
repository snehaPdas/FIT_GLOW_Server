import { Schema,model } from "mongoose";
import { LoginAdmin_interface } from "../interface/admin_interface";

const adminSchema=new Schema<LoginAdmin_interface>({
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    }
})

const AdminModel = model("Admin", adminSchema);
export default AdminModel;
