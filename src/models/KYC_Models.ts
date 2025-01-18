import { Schema, model } from "mongoose";
import { IKYC } from '../interface/trainer_interface';
const kycSchema = new Schema<IKYC>({
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: false },
    specializationId: [{ type: Schema.Types.ObjectId, ref: 'ISpecialization', required: false }],
    profileImage: { type: String, required: true },
    aadhaarFrontImage: { type: String, required: true },
    aadhaarBackImage: { type: String, required: true },
    certificate: { type: String, required: true },
    kycStatus: { type: String, enum: ['pending', 'approved', 'submitted', 'rejected'], default: 'pending' },
    kycSubmissionDate: { type: Date, default: Date.now },
    kycComments: { type: String, required: false },
}, { timestamps: true });

const KYCModel = model<IKYC>("KYC", kycSchema);
export default KYCModel

