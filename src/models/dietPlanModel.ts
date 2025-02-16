

import mongoose, { Schema, Document, model } from 'mongoose';

const dietPlanSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },  
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer" }, 
    morning: { type: String },
    lunch: { type: String },
    evening: { type: String },
    night: { type: String },
    totalCalories: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const DietPlanModel = model("DietPlan", dietPlanSchema);
export default DietPlanModel;
