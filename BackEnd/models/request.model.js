const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  senderAddress: { type: String, required: true },
  senderLat: { type: Number, required: true },  
  senderLng: { type: Number, required: true },  
  recipientAddress: { type: String, required: true },
  recipientLat: { type: Number, required: true },  
  recipientLng: { type: Number, required: true },
  productType: { type: String, required: true },
  requestDate: { type: String, required: true },  
  requestTime: { type: String, required: true },  
  productSize: { type: String, required: false },
  productImage: { type: String, required: false }, 
  createdAt: { type: Date, default: Date.now } ,    
  userEmail:{ type: String, required: true },
  accepted:{ type: Boolean, required: true },
  acceptedBy:{ type: String, required: false },
});

const RequestModel = mongoose.model('Request', RequestSchema);
module.exports = RequestModel;
