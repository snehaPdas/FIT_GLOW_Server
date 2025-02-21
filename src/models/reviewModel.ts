import mongoose, {Schema, model} from 'mongoose'
import { IReview } from '../interface/common'

const reviewSchema = new Schema<IReview>({
    userId:  {type: Schema.Types.ObjectId, ref: 'User'},
    trainerId: {type: Schema.Types.ObjectId, ref: 'Trainer'},
    rating: {type: Number, required: true},
    comment: {type: String, required: true}
}, {timestamps: true})

const ReviewModel = model<IReview>('Review', reviewSchema)

export default ReviewModel