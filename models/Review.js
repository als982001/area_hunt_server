import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
  imageUrl: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
