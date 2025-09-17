// const express = require('express');
// const Cashfreerouter = express.Router();
// const { createOrder, verifyPayment, getUserOrders } = require('../controllers/Cashfreegetway');

// Cashfreerouter.post('/create', createOrder);       
// Cashfreerouter.post('/verify', verifyPayment);      
// Cashfreerouter.get('/my-orders/:userId', getUserOrders); 

// module.exports = Cashfreerouter;



const express = require('express');
const Cashfreerouter = express.Router();
const { 
    createOrder, 
    verifyPayment, 
    getUserOrders, 
    handleWebhook,
} = require('../controllers/Cashfreegetway');
const userMiddleware = require('../middleware/userMiddleware');

// Payment routes
Cashfreerouter.post('/create', userMiddleware, createOrder);       
Cashfreerouter.post('/verify', userMiddleware, verifyPayment); // For authenticated users
Cashfreerouter.post('/verify-callback', verifyPayment); // For payment callbacks (no auth)     
Cashfreerouter.get('/my-orders/:userId', userMiddleware, getUserOrders); 
Cashfreerouter.post('/webhook', handleWebhook); // For Cashfree webhooks


module.exports = Cashfreerouter;
