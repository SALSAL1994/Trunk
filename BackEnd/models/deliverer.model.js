const mongoose = require('mongoose');

const DelivererSchema = new mongoose.Schema({
  name: String,
  departureDate: Date,
  departureTime: String,
  origin: String,
  destination: String,
  originLat: Number, 
  originLng: Number,
  destinationLat: Number,
  destinationLng: Number,
  delivererEmail: String,
});

const Deliverer = mongoose.model('Deliverer', DelivererSchema);

module.exports = Deliverer;
