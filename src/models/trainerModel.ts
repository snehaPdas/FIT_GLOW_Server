import { Schema, model, Types } from 'mongoose';
import { Interface_Trainer } from '../interface/trainer_interface';

const trainerSchema = new Schema<Interface_Trainer>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    specializations: [{ type: Schema.Types.ObjectId, ref: 'Specialization' }],
    isBlocked: { type: Boolean, default: false },
  }, { timestamps: true });
  
  const TrainerModel = model<Interface_Trainer>('Trainer', trainerSchema);  
  export default TrainerModel;
  