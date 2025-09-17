
const axios = require("axios");
const Order = require("../models/Order");
const { createNotification } = require("./notificationController");
const mongoose = require("mongoose");
require("dotenv").config();

const { CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_BASE_URL } = process.env;

// Create order with both COD and online payment support
exports.createOrder = async (req, res) => {
  try {
    // Validate environment variables first
    console.log("🔍 Environment check:", {
      SERVER_URL: process.env.SERVER_URL,
      CLIENT_URL: process.env.CLIENT_URL,
      CASHFREE_BASE_URL: CASHFREE_BASE_URL,
      hasAppId: !!CASHFREE_APP_ID,
      hasSecretKey: !!CASHFREE_SECRET_KEY,
    });

    if (!process.env.SERVER_URL || !process.env.CLIENT_URL) {
      console.error(
        "❌ Missing required environment variables: SERVER_URL or CLIENT_URL"
      );
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Missing environment variables",
      });
    }

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY || !CASHFREE_BASE_URL) {
      console.error("❌ Missing Cashfree environment variables");
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error",
      });
    }

    console.log("💳 Processing payment request:", req.body);

    const {
      userId,
      items,
      shippingAddress,
      paymentMethod,
      Contact_number,
      user_email,
      itemsTotal,
      deliveryCharge,
      totalAmount,
      notes,
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (!shippingAddress || !Contact_number || !user_email) {
      return res.status(400).json({
        success: false,
        message: "Shipping address, contact number, and email are required",
      });
    }

    // Calculate total with delivery charge
    let finalTotal = totalAmount;
    let calculatedItemsTotal = itemsTotal;
    let deliveryFee = deliveryCharge || 80; // Default delivery charge

    if (!finalTotal) {
      // Fallback calculation if frontend doesn't send totals
      calculatedItemsTotal = items.reduce((total, item) => {
        return total + parseFloat(item.price) * parseInt(item.quantity);
      }, 0);
      finalTotal = calculatedItemsTotal + deliveryFee;
    }

    console.log(`💰 Order breakdown:
      Items Total: ₹${calculatedItemsTotal}
      Delivery Charge: ₹${deliveryFee}
      Final Total: ₹${finalTotal}`);

    // Format items for order with product details
    const formattedItems = items.map((item) => ({
      productId: mongoose.Types.ObjectId.isValid(item.productId)
        ? new mongoose.Types.ObjectId(item.productId)
        : item.productId,
      quantity: parseInt(item.quantity) || 1,
      price: parseFloat(item.price) || 0,
      // Store product details for better order display
      name: item.name || null,
      image: item.image || null,
    }));

    // Enhanced base order data with delivery breakdown
    // In createOrder function, add this check for hamper orders
const baseOrderData = {
  userId: new mongoose.Types.ObjectId(userId),
  items: formattedItems,
  shippingAddress: {
    street: shippingAddress.street?.trim(),
    city: shippingAddress.city?.trim(),
    state: shippingAddress.state?.trim(),
    pincode: shippingAddress.pincode?.toString().trim(),
    country: shippingAddress.country || "India",
  },
  itemsTotal: calculatedItemsTotal,
  deliveryCharge: deliveryFee,
  totalAmount: finalTotal,
  paymentMethod: paymentMethod || "cod",
  Contact_number: Contact_number.toString(),
  user_email: user_email.trim(),
  notes: notes?.trim() || null,
  
  // ✅ Add this field to identify hamper orders
  isCustomHamper: req.body.isCustomHamper || false,
};


    // Handle COD orders - create immediately
    if (paymentMethod === "cod") {
      const codOrder = new Order({
        ...baseOrderData,
        paymentStatus: "pending",
        status: "pending",
      });

      const savedOrder = await codOrder.save();

      // Create notification
      await createNotification(
        userId,
        "COD Order Placed Successfully",
        `Your COD order #${savedOrder._id
          .toString()
          .slice(-6)
          .toUpperCase()} has been placed. Total: ₹${finalTotal} (Pay on delivery).`,
        "order",
        savedOrder._id
      );

      console.log("✅ COD Order created with delivery charge:", savedOrder._id);

      return res.json({
        success: true,
        message: "COD order created successfully",
        orderId: savedOrder._id, // ✅ Always return orderId
        order: savedOrder,
        paymentMethod: "cod",
      });
    }

    // Enhanced Cashfree API call with delivery charge
    if (paymentMethod === "online") {
      // ✅ IMPROVED: Shorter orderId generation (Cashfree has 45 char limit)
      const shortUserId = userId.toString().slice(-8);
      const timestamp = Date.now().toString().slice(-10); // Last 10 digits
      const orderId = `ORD_${timestamp}_${shortUserId}`;

      // ✅ IMPROVEMENT 1: Pre-create order in DB BEFORE Cashfree API call
      const pendingOrder = new Order({
        ...baseOrderData,
        paymentStatus: "initiated",
        status: "pending",
        paymentMethod: "online",
        cashfreeOrderId: orderId, // Store the orderId we generated
      });

      const savedOrder = await pendingOrder.save();

      const cashfreePayload = {
        order_id: orderId,
        order_amount: finalTotal, // Use final total including delivery
        order_currency: "INR",
        customer_details: {
          customer_id: userId.toString(),
          customer_email: user_email,
          customer_phone: Contact_number.toString()
            .replace(/\D/g, "")
            .slice(-10),
        },
        order_meta: {
          return_url: `${process.env.CLIENT_URL}/payment/callback?order_id={order_id}`,
          notify_url: `${process.env.SERVER_URL}/cashfree/webhook`,
          payment_methods: "cc,dc,nb,upi,app",
        },
      };

      try {
        console.log(
          "💳 Creating Cashfree session with delivery charge:",
          cashfreePayload
        );
        console.log("📋 API URL:", `${CASHFREE_BASE_URL}/orders`);

        const response = await axios.post(
          `${CASHFREE_BASE_URL}/orders`,
          cashfreePayload,
          {
            headers: {
              "x-client-id": CASHFREE_APP_ID,
              "x-client-secret": CASHFREE_SECRET_KEY,
              "Content-Type": "application/json",
              "x-api-version": "2022-09-01",
            },
          }
        );

        // ✅ Save any session-related info if needed
        savedOrder.cashfreeSessionData = response.data;
        await savedOrder.save();

        console.log("✅ Cashfree session created:", response.data);

        // ✅ IMPROVEMENT 2: Consistent response structure with clear orderId field
        return res.json({
          success: true,
          message: "Payment session created",
          cashfreeSession: response.data,
          orderId: orderId, // Cashfree order ID
          internalOrderId: savedOrder._id, // Our DB order ID
          paymentMethod: "online",
        });
      } catch (cashfreeError) {
        console.error(
          "❌ Cashfree API error:",
          cashfreeError.response?.data || cashfreeError.message
        );

        // ✅ IMPROVEMENT 3: Mark order as failed but still return internal order ID
        savedOrder.status = "failed";
        savedOrder.paymentStatus = "failed";
        await savedOrder.save();

        return res.status(500).json({
          success: false,
          message: "Payment gateway error",
          orderId: savedOrder._id, // Still return our internal order ID
          error: cashfreeError.response?.data || cashfreeError.message,
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment method. Use 'cod' or 'online'",
    });
  } catch (error) {
    console.error("❌ Payment creation error:", error);

    if (error.response) {
      console.error("Cashfree API Error:", error.response.data);
      return res.status(500).json({
        success: false,
        message: "Payment gateway error",
        error: error.response.data,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during payment creation",
      error: error.message,
    });
  }
};


// ✅ FIXED: Enhanced verifyPayment that handles multiple attempts
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, internalOrderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find order
    let order = await Order.findOne({ cashfreeOrderId: orderId });
    if (!order && internalOrderId) {
      order = await Order.findById(internalOrderId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ Fetch ALL payment attempts for this order
    const verificationResponse = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderId}/payments`,
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
        },
      }
    );

    const payments = verificationResponse.data || [];
    console.log(`💳 Found ${payments.length} payment attempts for order ${orderId}`);

    // ✅ Check if ANY payment was successful (not just the latest)
    const successfulPayment = payments.find(payment => payment.payment_status === "SUCCESS");
    const hasSuccessfulPayment = !!successfulPayment;

    console.log('🔍 Payment attempts:', payments.map(p => ({
      id: p.cf_payment_id,
      status: p.payment_status,
      method: p.payment_method
    })));

    if (hasSuccessfulPayment) {
      // ✅ At least one payment succeeded - mark order as successful
      order.paymentStatus = "paid";
      order.status = "processing";
      order.paymentId = successfulPayment.cf_payment_id;
      await order.save();

      console.log("✅ Order marked as successful due to successful payment attempt");

      return res.json({
        success: true,
        message: "Payment verified successfully",
        paymentStatus: "SUCCESS",
        order,
        paymentDetails: payments
      });
    } else {
      // ✅ No successful payments found
      order.paymentStatus = "failed";
      order.status = "failed";
      await order.save();

      console.log("❌ All payment attempts failed");

      return res.json({
        success: false,
        message: "All payment attempts failed",
        paymentStatus: "FAILED",
        order,
        paymentDetails: payments
      });
    }

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};


// Enhanced getUserOrders with better population
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Build filter
    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    if (status && status !== "all") filter.status = status;
    if (paymentStatus && paymentStatus !== "all")
      filter.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    console.log("🔍 Fetching orders with population...");

    const orders = await Order.find(filter)
      .populate({
        path: "items.productId",
        select:
          "Product_name Product_image Hamper_price Product_price name image",
        options: { strictPopulate: false }, // This helps with missing references
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("📦 Orders found:", orders.length);

    if (orders.length > 0) {
      console.log("🔍 Sample populated item:", orders[0].items);
    }

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching orders",
      error: error.message,
    });
  }
};

// Enhanced webhook handler
exports.handleWebhook = async (req, res) => {
  try {
    console.log("🔔 Cashfree webhook received:", req.body);

    const { type, data } = req.body;

    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { order_id, payment_status, cf_payment_id } = data;

      // Find and update order
      const order = await Order.findOne({ cashfreeOrderId: order_id });

      if (order && payment_status === "SUCCESS") {
        order.paymentStatus = "paid";
        order.status = "processing";
        order.paymentId = cf_payment_id;
        order.paymentMethod = "online"; // Ensure correct payment method
        await order.save();

        await createNotification(
          order.userId,
          "Payment Confirmed",
          `Your payment of ₹${
            order.totalAmount
          } has been confirmed. Order #${order._id
            .toString()
            .slice(-6)
            .toUpperCase()} is now processing.`,
          "order",
          order._id
        );

        console.log("✅ Order updated via webhook:", order._id);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
