import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    cost: {
      type: Number,
      required: true,
      //include phone number validation?
    },
    length: {
      type: String,
      required: true,
      max: 50,
    },
    info: {
      type: String,
      required: true,
      max: 300,
    },
    bookings: {
      type: Array,
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", ServiceSchema);
export default Service;
