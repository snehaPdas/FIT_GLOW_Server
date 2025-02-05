import {Request,Response,NextFunction} from "express"
import jwt from "jsonwebtoken"


export interface CustomRequest extends Request{
    authData?:{id:string;email:string;role:string}
}

const authMiddleware=(roles:string[]=[])=>{
    console.log("in n auth middleware.......")
    

    
    return async ( req:CustomRequest,res:Response,next:NextFunction)=>{
            console.log("////////////")
        const token=req.header("Authorization")?.split(" ")[1]
        console.log("token checkinhhhh",token)
        if(!token){
            res.status(401).json({message:"Access Denied,token Missing"})

             return 
        }
        try {
        
            const decode:any=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET as string) as CustomRequest["authData"]
            
            //  const userId= req.authData?.id
        //role check
            if(roles.length && !roles.includes(decode.role) ){
                res.status(403).json({message:"Access denied ,Role insuffcient "})
                return
            }
            req.authData=decode
        
        next()
    }catch (error) {
         res.status(401).json({message:"invalid or expire token"})   
    }
}

}
export default authMiddleware