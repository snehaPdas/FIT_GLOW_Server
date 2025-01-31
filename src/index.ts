import  express ,{Application} from "express";
import connectDB from "./utils/db"

import userRoute from "../src/routes/userRoute"
import adminRoute from "../src/routes/adminRoute"
import trainerRoute from "../src/routes/trainerRoute"
import MessagesRoute from "../src/routes/messageRoute";

import dotenv from 'dotenv';
import path from "path";
import cors from 'cors'
import cookieParser from "cookie-parser"


const app=express()
app.use(express.json());

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions))
  
  dotenv.config();
  app.use(express.urlencoded({ extended: true }));
  
  



connectDB();
app.use(express.json());  
app.use(cookieParser())

// Routes
app.use("/api/user/", userRoute);
app.use("/api/admin/", adminRoute);
app.use("/api/trainer/",trainerRoute)
app.use("/api/messages/", MessagesRoute);



console.log('hit index'); 



app.listen( 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });