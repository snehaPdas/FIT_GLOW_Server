import {v2 as cloudinary} from "cloudinary"
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,

})

export default cloudinary;
interface CloudinaryUploadResult {
    secure_url: string;
  }

export const uploadToCloudinary=(fileBuffer:Buffer,folder:string)=>{
return new Promise((resolve,reject)=>{
    cloudinary.uploader.upload_stream({folder},(error,result)=>{
        if(error){
            reject(error)
        }else{
            resolve(result as CloudinaryUploadResult )
        }
    }).end(fileBuffer)
})
}