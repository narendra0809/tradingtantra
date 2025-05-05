import mongoose from "mongoose";



const FeedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    image:{
        type: String,
    },
     
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps: true});

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;