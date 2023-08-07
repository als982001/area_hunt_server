import mongoose, { mongo } from "mongoose";

const accountSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  name: { type: String, required: true },
  userId: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  places: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

const Account = mongoose.model("Account", accountSchema);

export default Account;
