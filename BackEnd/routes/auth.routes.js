const express = require('express');
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('../models/users.model'); 
const router = express.Router();
const multer = require('multer');
const Deliverer = require('../models/deliverer.model'); // Import the Deliverer model
const RequestModel = require('../models/request.model'); // Request model
const mongoose = require('mongoose');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Create a unique file name
  }
});

const upload = multer({ storage: storage }); 

// ====================== Registration Route ======================
router.post('/signup', async (req, res) => {
  const { username, email, password, roles } = req.body;

  try {
    // Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      roles // Save the roles array (e.g. ['deliverer', 'requester'])
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// ====================== Login Route ======================
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Store user session info
    req.session.user = {
      id: user._id,
      username: user.username,
      roles: user.roles,
    };

    // Send user details in response
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/request", upload.single('productImage'), async (req, res) => {
  try {
   
    const {
      name,
      senderAddress,
      senderLat,
      senderLng,
      recipientAddress,
      recipientLat,
      recipientLng,
      productType,
      requestDate,
      requestTime,
      productSize,
      userEmail,
      accepted
    } = req.body.newRequest;
    const productImage = req.file; // Access the uploaded file if available

   
    const newRequest = new RequestModel({
      name,
      senderAddress,
      senderLat,
      senderLng,
      recipientAddress,
      recipientLat,
      recipientLng,
      productType,
      requestDate,
      requestTime,
      productSize,
      productImage: productImage ? productImage.filename : null,
      userEmail,
      accepted
    });

    // Save the request to the database
    const savedRequest = await newRequest.save();

    // Send success response with the saved data
    res.status(201).json({
      message: 'Request submitted successfully!',
      data: savedRequest
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      message: 'An error occurred while processing your request.',
      error: error.message
    });
  }
});


async function findNearbyRequests(originLat, originLng, destinationLat, destinationLng, departureDate) {
  const query = {
    requestDate: departureDate,
    $or: [
      {
        $and: [
          {
            senderLat: {
              $gte: originLat - 0.09,
              $lte: originLat + 0.09,
            }
          },
          {
            senderLng: {
              $gte: originLng - 0.09,
              $lte: originLng + 0.09,
            }
          }
        ]
      },
      {
        $and: [
          {
            recipientLat: {
              $gte: destinationLat - 0.09,
              $lte: destinationLat + 0.09,
            }
          },
          {
            recipientLng: {
              $gte: destinationLng - 0.09,
              $lte: destinationLng + 0.09,
            }
          }
        ]
      }
    ]
  };

  console.log("Query: ", JSON.stringify(query, null, 2)); 

 
  return await RequestModel.find(query); 

}


router.post('/save-deliverer', async (req, res) => {
  try {
    const { name, departureDate, departureTime, origin, destination, originLat, originLng, destinationLat, destinationLng } = req.body.delivererData;

    const newDeliverer = new Deliverer({
      name,
      departureDate,
      departureTime,
      origin,
      destination,
      originLat,
      originLng,
      destinationLat,
      destinationLng
    });

    // await newDeliverer.save();

  
    const nearbyRequests = await findNearbyRequests(originLat, originLng, destinationLat, destinationLng, departureDate);

    
    res.status(200).json({
      message: 'Deliverer saved successfully!',
      nearbyRequests
    });
  } catch (error) {
    console.error('Error saving deliverer:', error);
    res.status(500).json({ message: 'Error saving deliverer.' });
  }
});




module.exports = router;
