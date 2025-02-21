import UserRepository from "../repositories/userRepository";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const userRepository = new UserRepository();

async function isBlocked(req: Request, res: Response, next: NextFunction): Promise<void> {
    
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        
        if (!token) {
            res.status(401).json({ message: "Access denied. No token provided." });
            return;
        }

        const secretKey = process.env.ACCESS_TOKEN_SECRET || "yourSecretKey"; 
        const decoded = jwt.verify(token, secretKey) as JwtPayload;


        const user_id = decoded.id;
        
        if (!user_id) {
            res.status(403).json({ message: "Access denied. User ID not found." });
            return;
        }

        const isBlocked = await userRepository.userIsBlocked(user_id);
        
        console.log("is blocked confirmation is",isBlocked)
        if (isBlocked) {
            
            res.status(403).json({message:"Blocked"});
            return;
        }

        next();

    } catch (error) {
        res.status(500).json({ message: "server Error" });
    }
}

export default isBlocked;
