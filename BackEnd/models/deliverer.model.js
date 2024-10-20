const mongoose = require('mongoose');

const DelivererSchema = new mongoose.Schema({
  name: String,
  departureDate: Date,
  departureTime: String,
  origin: String,
  destination: String,
  originLat: Number, // Storing coordinates
  originLng: Number,
  destinationLat: Number,
  destinationLng: Number,
});

const Deliverer = mongoose.model('Deliverer', DelivererSchema);

module.exports = Deliverer;
