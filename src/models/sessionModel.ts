import {Schema,model} from "mongoose"
import { ISession } from "../interface/trainer_interface"

const sessionSchema=new Schema<ISession>({
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer",},
    specializationId: { type: Schema.Types.ObjectId, ref: "Specialization" },
    startDate: { type: Date },
    endDate: { type: Date },
    selectedDate: { type: Date },
    startTime: { type: String, },
    endTime: { type: String, },
    type: { type: String },
    price: { type: Number, required: false },
    isBooked: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Completed", "Cancelled" ,"InProgress"],
        default: "Pending",
        
    },
    paymentIntentId: { type: String, required: false },

},{ timestamps: true })

const SessionModel=model<ISession>("Session",sessionSchema)

export default SessionModel;
