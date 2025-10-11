
const Otp = require("../models/otp");
const User = require("../models/user");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist"); // ✅ Add this import
const validate = require("../utils/validator");
const crypto = require("crypto");
const { sendEmail, generateOTP } = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const register = async (req, res) => {
  try {
    validate(req.body);

    const { firstName, email, password, confirmPassword } = req.body;

    if (!firstName || !email || !password || !confirmPassword) {
      throw new Error("All credentials are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Password Doesn't Match");
    }

    delete req.body.confirmPassword;

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || !otpRecord.isVerified) {
      throw new Error(
        "Email is not verified. Please verify your email before registering."
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      firstName,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: true,
    };

    const user = await User.create(userData);

    // ✅ Create both Cart and Wishlist for the new user
    try {
      await Promise.all([
        Cart.create({
          userId: user._id,
          items: [],
          updatedAt: new Date(),
        }),
        Wishlist.create({
          user: user._id,
          items: []
        })
      ]);
      console.log(`Cart and Wishlist created for new user: ${user.email}`);
    } catch (creationError) {
      console.error("Error creating cart/wishlist for user:", creationError);
      // Don't fail registration if cart/wishlist creation fails
    }

    const accessToken = generateAccessToken({
      _id: user._id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    const reply = {
      firstName: user.firstName,
      email: user.email,
      _id: user._id,
      role: user.role,
      token: accessToken // ✅ Add token to reply
    };

    res.status(201).json({
      user: reply,
      accessToken,
      message: `${
        user.role.charAt(0).toUpperCase() + user.role.slice(1)
      } Registered Successfully`,
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(401).json({ message: "Error: " + err.message }); // ✅ Return JSON
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Credentials missing" });

    const user = await User.findOne({ email: email });

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    // ✅ Ensure user has both Cart and Wishlist (create if doesn't exist)
    try {
      const [existingCart, existingWishlist] = await Promise.all([
        Cart.findOne({ userId: user._id }),
        Wishlist.findOne({ user: user._id })
      ]);

      const promises = [];
      
      if (!existingCart) {
        promises.push(Cart.create({
          userId: user._id,
          items: [],
          updatedAt: new Date(),
        }));
      }

      if (!existingWishlist) {
        promises.push(Wishlist.create({
          user: user._id,
          items: []
        }));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        console.log(`Cart/Wishlist ensured for user: ${user.email}`);
      }
    } catch (creationError) {
      console.error("Error ensuring cart/wishlist exists for user:", creationError);
      // Don't fail login if cart/wishlist creation fails
    }

    const accessToken = generateAccessToken({
      _id: user._id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const reply = {
      firstName: user.firstName,
      email: user.email,
      _id: user._id,
      role: user.role,
      token: accessToken,
      isVerified: user.isVerified
    };

    res.status(200).json({
      reply: reply,
      accessToken,
      message: "User Logged In Successfully",
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    await Otp.deleteMany({ email });

    const otpCode = generateOTP(6);
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otpCode.toString())
      .digest("hex");

    console.log("Creating OTP for:", email);
    console.log("Hashed OTP:", hashedOTP);

    const newOtp = await Otp.create({ email, otp: hashedOTP });

    console.log("OTP saved:", newOtp);
    await newOtp.save();
const message = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #5a2d47; font-size: 16px; line-height: 1.6; background: linear-gradient(135deg, #fff5f7 0%, #ffeef2 100%); padding: 40px 30px; border-radius: 20px;">
    
    <!-- Header with Branding -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%); padding: 20px; border-radius: 15px; display: inline-block;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">
          TheLoveCraft
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px; font-style: italic;">
          Exquisite Handcrafted Gifts
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(219, 39, 119, 0.1);">
      <p style="margin: 0 0 15px; color: #5a2d47; font-size: 18px;">
        Dear Valued Customer,
      </p>
      
      <p style="margin: 0 0 20px; color: #7e3a5f;">
        Thank you for choosing TheLoveCraft! Your One-Time Password for verification is:
      </p>

      <!-- OTP Display -->
      <div style="text-align: center; margin: 30px 0;">
        <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 20px; border-radius: 12px; display: inline-block; border: 2px dashed #ec4899;">
          <div style="font-size: 32px; font-weight: 700; color: #be185d; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otpCode}
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div style="background: #fdf2f8; padding: 15px; border-radius: 10px; border-left: 4px solid #ec4899; margin: 25px 0;">
        <p style="margin: 0; color: #7e3a5f; font-size: 14px;">
          ⏰ <strong>Valid for 10 minutes</strong><br>
          🔒 <strong>Do not share this OTP with anyone</strong><br>
          ✨ <strong>For your account security</strong>
        </p>
      </div>

      <p style="margin: 20px 0 0; color: #9d4b6d; font-size: 14px; text-align: center;">
        If you didn't request this verification, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f9a8d4;">
      <p style="margin: 0 0 10px; color: #9d4b6d; font-size: 14px;">
        With love and sparkles ✨
      </p>
      <p style="margin: 0; color: #ec4899; font-weight: 600; font-size: 16px;">
        The LoveCraft Team
      </p>
      <p style="margin: 10px 0 0; color: #c0849d; font-size: 12px;">
        Crafting memories that last a lifetime 💖
      </p>
    </div>

    <!-- Decorative Elements -->
    <div style="text-align: center; margin-top: 20px;">
      <span style="display: inline-block; width: 8px; height: 8px; background: #ec4899; border-radius: 50%; margin: 0 5px;"></span>
      <span style="display: inline-block; width: 8px; height: 8px; background: #f472b6; border-radius: 50%; margin: 0 5px;"></span>
      <span style="display: inline-block; width: 8px; height: 8px; background: #f9a8d4; border-radius: 50%; margin: 0 5px;"></span>
      <span style="display: inline-block; width: 8px; height: 8px; background: #f472b6; border-radius: 50%; margin: 0 5px;"></span>
      <span style="display: inline-block; width: 8px; height: 8px; background: #ec4899; border-radius: 50%; margin: 0 5px;"></span>
    </div>
  </div>
`;

    await sendEmail(email, "Verify your email", message);

    // ✅ Fixed:
    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
      // Don't include OTP in response
    });
  } catch (err) {
    console.error("Error in sendOtp:", err.message, err.stack);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    const existingOtp = await Otp.findOne({ email, otp: hashedOTP });

    if (!existingOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (existingOtp.expiresAt && existingOtp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await Otp.updateOne({ email }, { $set: { isVerified: true } });

    const message = `<p>Your email <b>${email}</b> has been successfully verified! </p>`;
    await sendEmail(email, "Email Verified Successfully", message);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
 
    if (!token) {
      return res.status(400).json({ message: "No token found in cookies" });
    }

    const payload = jwt.decode(token);

    if (!payload || !payload.exp) {
      return res.status(400).json({ message: "Invalid token" });
    }

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp * 1000);

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    if (req.session) {
      req.session.destroy();
    }

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "User Logged Out Successfully" });
  } catch (err) {
    console.error("Logout Error:", err.message);
    res.status(500).json({ message: "Error logging out", error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await Otp.deleteMany({ email });

    const otp = generateOTP(6);
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    await Otp.create({ email, otp: hashedOTP });

    const message = `<p>Your OTP for password reset is <b>${otp}</b>. Valid for 5 minutes.</p>`;
    await sendEmail(email, "Reset Your Password", message);

    res.status(200).json({ message: "OTP sent to your email", otp }); // remove `otp` in prod
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email & OTP required" });

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");
    const existingOtp = await Otp.findOne({ email, otp: hashedOtp });

    if (!existingOtp)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    existingOtp.isVerified = true;
    await existingOtp.save();
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpEntry = await Otp.findOne({ email });
    if (!otpEntry || !otpEntry.isVerified) {
      return res.status(401).json({ message: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ email });

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({ message: "User promoted to admin successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) throw new Error("No refresh token");

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { _id: payload._id, email: payload.email, role: payload.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res
      .status(200)
      .json({
        success: true,
        newAccessToken,
        message: "New Access Token Generated",
      });
  } catch (err) {
    console.error(err.message);
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

module.exports = {
  register,
  sendOtp,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  refreshToken,
  promoteToAdmin,
};
