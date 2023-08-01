import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: { type: String, required: true },
  content: { type: String, required: true },
  publisherId: { type: String, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

const Place = mongoose.model("Place", placeSchema);

export default Place;
