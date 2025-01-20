import mongoose, { Schema,model } from "mongoose";
import { IBooking } from "../interface/common";

const bookingSchema=new Schema<IBooking>({
    sessionId:{type:Schema.Types.ObjectId, ref:"Session",required:false},
    trainerId:{type:Schema.Types.ObjectId,ref:"Trainer"},
    userId:{type:Schema.Types.ObjectId,ref:"User"},
    specialization: { type: String, required: false },
    sessionType: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now }, 
    startDate: { type: Date, required: true }, 
    endDate: { type: Date, required: false }, 
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: [ "Confirmed", "Cancelled", "Completed"], default: "Confirmed" }, 
    payment_intent: {type: String, required: false },


})


const BookingModel =model<IBooking>("Booking",bookingSchema)
export default BookingModel;
