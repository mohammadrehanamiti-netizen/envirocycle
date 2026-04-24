import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  role: String,
  password: { type: String, required: true },
   points: { type: Number, default: 0 },
  lastLogin: { type: Date }
});

export default mongoose.model("User", UserSchema);
