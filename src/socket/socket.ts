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
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      console.log(`User with ID: ${userId} disconnected and removed from socket map`);
    }});

socket.on('sendMessage', (data) => {
    if (userId) {
      
      
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

  socket.on("accept-incoming-call", async (data) => {
  
    try {
      const friendSocketId = await getReceiverSocketId(data.to);
      if (friendSocketId) {
        const startedAt = new Date();
        const videoCall = {
          trainerId: data.from,
          userId: data.to,
          roomId: data.roomId,
          duration: 0, 
          startedAt,
          endedAt: null, 
          createdAt: new Date(),
          updatedAt: new Date(),
        };
       
        
        socket.to(friendSocketId).emit("accepted-call", { ...data, startedAt });
      } else {
        console.error(`No socket ID found for the receiver with ID: ${data.to}`);
      }
    } catch (error: any) {
      console.error("Error in accept-incoming-call handler:", error.message);
    }
  });
  
  socket.on('trainer-call-accept',async (data) => {
    const trainerSocket = await getReceiverSocketId(data.trainerId)
    
    if(trainerSocket) {

      socket.to(trainerSocket).emit('trainer-accept', data)
    }
  })

  socket.on('reject-call', (data) => {
    const friendSocketId = getReceiverSocketId(data.to);
    if (friendSocketId) {
      
      socket.to(friendSocketId).emit('call-rejected');
    } else {
      console.error(`No socket ID found for the receiver with ID: ${data.to}`);
    }
  });

  socket.on("leave-room", (data) => {
    const friendSocketId = getReceiverSocketId(data.to);
    console.log('friendSocketId',friendSocketId, 'data', data.to);
    if (friendSocketId) {
      socket.to(friendSocketId).emit("user-left",data.to);
    }
  });

  socket.on("newBookingNotification", (data) => {

    const receiverSocketId = getReceiverSocketId(data.receiverId);
  
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveNewBooking", data.content);
    } else {
      console.warn("Receiver not connected:", data.receiverId);
    }
  });
  socket.on('cancelTrainerNotification', (data) => {
    const receiverSocketId = getReceiverSocketId(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveCancelNotificationForTrainer", data.content);
      console.log("Notification sent to client:", data);
    } else {
      console.warn("No receiverSocketId found for receiverId:", data.receiverId);
    }
  });

  socket.on('cancelUserNotification', (data) => {
    const receiverSocketId = getReceiverSocketId(data.userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveCancelNotificationForUser", data.content);
      console.log("Notification sent to client:", data);
    } else {
      console.warn("No receiverSocketId found for receiverId:", data.receiverId);
    }
  });

  


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
})

export { app, io, server };
