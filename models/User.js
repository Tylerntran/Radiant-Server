import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    phoneNumber: {
      type: String,
      required: true,
      //include phone number validation?
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      max: 50,
    },
    appointments: {
      type: Array,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
