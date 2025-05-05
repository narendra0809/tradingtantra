import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    displayName: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    avatar: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: String,
    },
    
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
