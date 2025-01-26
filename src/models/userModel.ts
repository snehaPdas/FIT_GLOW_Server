import  {Schema,model} from "mongoose"
import { IUser } from '../interface/common';

const userSchema=new Schema<IUser>({
   name:{type:String,required:true} ,
   email:{type:String,required:true,unique:true},
   phone: { type: Number },
   password: { type: String},
   dob: { type: String, required: false },
   image: { type: String, required: false },
   gender: { type: String, required: false },
   isBlocked: { type: Boolean, default: false },
   height:{type:String,required:false},
   weight:{type:String,required:false}
 },
 { timestamps: true }
)

const UserModel=model<IUser>("User",userSchema)
export default UserModel;