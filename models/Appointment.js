import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
      min: 2,
      max: 50,
    },
    services: {
      type: Array,
      required: true,
      //include phone number validation?
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    length: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
    },
    notes: {
      type: String,
      max: 300,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);
export default Appointment;
