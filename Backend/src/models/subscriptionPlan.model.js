import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, //plan name e.g basic, premium, etc
  price: {
    type: Number,
    required: true,
  }, //plan price
  duration:{
    type: Number,
    default: 30,
  },
  status:{
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  }


});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
