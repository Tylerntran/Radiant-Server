import mongoose from "mongoose";

const BookedServiceSchema = new mongoose.Schema(
  {
    service: {
      type: Service,
    },
    date: {
      type: String,
      required: true,
    },
  }
  { timestamps: true }
);

const BookedService = mongoose.model("BookedService", BookedServiceSchema);
export default BookedService;
