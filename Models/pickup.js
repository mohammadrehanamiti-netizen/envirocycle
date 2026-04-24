import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  date: String,
  materialType: String,
});

const Pickup = mongoose.model('Pickup', pickupSchema);
export default Pickup;
