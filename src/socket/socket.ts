import { Server  } from "socket.io"
import dotenv from "dotenv"
import express from "express"
import http from "http"



dotenv.config()
const app=express()
const server=http.createServer(app)

const io=new Server(server,{
    cors:{
      origin: "http://localhost:5173", 
      credentials:true
    }
})
console.log('io------------------',io);

const userSocketMap: Record<string, string> = {}; 


export const getReceiverSocketId=(receiverId:string)=>{
   
    return userSocketMap[receiverId]
}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string; 
    console.log('userIduserId',userId);
    
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

  socket.on("outgoing-video-call", (data) => {
    const userSocketId = getReceiverSocketId(data.to);
    if (userSocketId) {
      io.to(userSocketId).emit('incoming-video-call', {
        _id: data.to,
        from: data.from,
        callType: data.callType,
        trainerName: data.trainerName,
        trainerImage: data.trainerImage,
        roomId: data.roomId,
      });
    } else {
      console.log(`Receiver not found for user ID: ${data.to}`);
    }
  });




  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
})

export { app, io, server };
