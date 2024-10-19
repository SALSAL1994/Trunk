const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  senderAddress: { type: String, required: true },
  senderLat: { type: Number, required: true },  // Latitude for sender
  senderLng: { type: Number, required: true },  // Longitude for sender
  recipientAddress: { type: String, required: true },
  recipientLat: { type: Number, required: true },  // Latitude for recipient
  recipientLng: { type: Number, required: true },  // Longitude for recipient
  productType: { type: String, required: true },
  requestDate: { type: String, required: true },  // Could be changed to `Date` if needed
  requestTime: { type: String, required: true },  // Could be changed to `Date` if needed
  productSize: { type: String, required: false },
  productImage: { type: String, required: false }, // Store image path or name
  createdAt: { type: Date, default: Date.now }     // Automatically sets the creation date
});

const RequestModel = mongoose.model('Request', RequestSchema);
module.exports = RequestModel;
