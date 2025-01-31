import mongoose from "mongoose";
import { IMessage } from "../models/MessageModel";
import ConversationModel from "../models/conversationModel";
import { getReceiverSocketId, io } from "../socket/socket";

import MessageModel from "../models/MessageModel";
import UserModel from '../models/userModel';
import TrainerModel from '../models/trainerModel';





class MessageService {
  async sendMessage( senderId: string,receiverId: string,  message: string): Promise<IMessage> {
    let senderModel: 'User' | 'Trainer' | null = null;
    let receiverModel: 'User' | 'Trainer' | null = null

    // Validate sender model
    if (await UserModel.exists({ _id: senderId })) {
        senderModel = 'User';
    } else if (await TrainerModel.exists({ _id: senderId })) {
        senderModel = 'Trainer';
    }

    // Validate receiver model
    if (await UserModel.exists({ _id: receiverId })) {
        receiverModel = 'User';
    } else if (await TrainerModel.exists({ _id: receiverId })) {
        receiverModel = 'Trainer';
    }

    // If either sender or receiver ID is invalid, throw an error
    if (!senderModel || !receiverModel) {
        throw new Error('Invalid sender or receiver ID');
    }

    let existingConversation = await ConversationModel.findOne({
    
        participants: {
            $all: [
                { participantId: new mongoose.Types.ObjectId(senderId), participantModel: senderModel },
                { participantId: new mongoose.Types.ObjectId(receiverId), participantModel: receiverModel }
            ]
        }
    });

    if (!existingConversation) {
        existingConversation = new ConversationModel({
            participants: [
                { participantId: new mongoose.Types.ObjectId(senderId), participantModel: senderModel },
                { participantId: new mongoose.Types.ObjectId(receiverId), participantModel: receiverModel }
            ],
            messages: []
        });
        await existingConversation.save();
    }

    const newMessage = new MessageModel({
        senderId: new mongoose.Types.ObjectId(senderId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        message,
        senderModel,
        receiverModel,
        conversationId: existingConversation._id,
    });

    const savedMessage: any = await newMessage.save();

   existingConversation.messages.push(savedMessage);
    await existingConversation.save();
    
    // Get the receiver's socket ID
const receiverSocketId = getReceiverSocketId(receiverId); 

// console.log('receiverSocketId?????????????',receiverSocketId);
if (receiverSocketId) {
    io.to(receiverSocketId).emit('newMessage', newMessage);
}

    return savedMessage;
}

////////////////////////////////////////////////////////
async getMessage(senderId: string, userToChatId: string) {
  const senderObjectId = new mongoose.Types.ObjectId(senderId);
  const receiverObjectId = new mongoose.Types.ObjectId(userToChatId);

console.log("senderid issssssss",senderId,userToChatId)

  // Identify the model
  const senderModel = (await UserModel.exists({ _id: senderObjectId })) ? 'User' :
      (await TrainerModel.exists({ _id: senderObjectId })) ? 'Trainer' : null;
  const receiverModel = (await UserModel.exists({ _id: receiverObjectId })) ? 'User' :
      (await TrainerModel.exists({ _id: receiverObjectId })) ? 'Trainer' : null;

  if (!senderModel || !receiverModel) {
      throw new Error('Invalid sender or receiver ID');
  }



  const conversations = await ConversationModel.find({
      participants: {
          $all: [
              { $elemMatch: { participantId: senderObjectId, participantModel: senderModel } },
              { $elemMatch: { participantId: receiverObjectId, participantModel: receiverModel } }
          ]
      }
  }).populate('messages');
  console.log('conversatiosn', conversations);

  const allConversations = conversations.flatMap(conversation => conversation.messages)
     console.log("all conversation is",allConversations)
  return allConversations
}
}

export default new MessageService();
