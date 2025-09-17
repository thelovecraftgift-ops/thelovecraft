
require("dotenv").config();
const express = require("express");
const app = express();
const ShipRocketrouter = require("./routes/ShiprocketRoutes")
const cors = require("cors");
const helmet = require("helmet"); 
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const redisClient = require("./config/redis");
const authRouter = require("./routes/auth");
const passport = require("./config/passport"); 
const session = require("express-session");
const AdminRouter = require("./routes/AdminRoutes");
const dataRouter = require("./routes/getDataRoutes"); 
const orderRouter = require("./routes/orderRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const notificationRouter = require("./routes/notificationRoutes"); 
const cartRouter = require("./routes/cartRoutes");
const numberVerifyrouter = require("./routes/NumberVerifyRoutes");
const Cashfreerouter = require("./routes/cashfreeRoutes");
const hamperRouter = require("./routes/CreateHamperRoutes")

// ✅ ADD THESE MODEL IMPORTS TO REGISTER THEM WITH MONGOOSE
require("./models/AddPost");
require("./models/Cart");       
require("./models/Order");       
require("./models/Wishlist");    
require("./models/user");      
require("./models/Notification"); 
require("./models/hamperModel"); 



const PORT_NO = process.env.PORT_NO || 3000;
 
app.use(express.json());
app.use(cookieParser());

app.use(helmet());
const allowedOrigins = process.env.CLIENT_URL.split(",");
app.use(cors({
  origin: allowedOrigins,  // Use the environment variable
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));


app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // Set to true if using HTTPS
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/admin", AdminRouter);
app.use("/api", dataRouter);
app.use("/orders", orderRouter);
app.use("/wishlist", wishlistRouter);
app.use("/cart", cartRouter);
app.use("/notifications", notificationRouter);
app.use("/shiprocket",ShipRocketrouter);
app.use("/api/verify",numberVerifyrouter);
app.use("/cashfree",Cashfreerouter);
app.use("/hamper",hamperRouter);

const initialConnection = async () => {
  try {
    await Promise.all([redisClient.connect(), database()]);
    console.log("Databases Connected");
    console.log("All models registered successfully"); // Added confirmation

    app.listen(PORT_NO, () => {
      console.log(`Server is Listening on port no ${PORT_NO}`);
    });
  } catch (err) {
    console.log("Error :-  " + err); 
  }
}; 

initialConnection();
