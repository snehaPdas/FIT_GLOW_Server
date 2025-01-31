import { Server  } from "socket.io"
import dotenv from "dotenv"
import express from "express"
import http from "http"



dotenv.config()
const app=express()
const server=http.createServer(app)

const io=new Server(server,{
    cors:{
    origin:process.env.CORS_ORIGIN,
    credentials:true
    }
})

const userSocketMap: Record<string, string> = {}; 


export const getReceiverSocketId=(receiverId:string)=>{
   
    return userSocketMap[receiverId]
}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string; 
if (userId) {
 
    userSocketMap[userId] = socket.id; 
    console.log(`User ${userId} connected with socket ${socket.id}`);
}
socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
    delete userSocketMap[userId];
});

socket.on('sendMessage', (data) => {
    if (userId) {
      // console.log('sendMessage', data);
      
      io.emit('messageUpdate',data) 
    } else {
      console.error("receiverId is missing in sendMessage data");
    }
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
})

export { app, io, server };
