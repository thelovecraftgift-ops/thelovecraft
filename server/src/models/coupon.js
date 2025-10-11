const Mongoose = require("mongoose");
const {Schema} = Mongoose

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    percent: {
      type: Number,
      min: 0,
      max: 100,
    },
    rupees: {
      type: Number,
      min: 0,
    },
    minOrder: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    startsAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      min: 0,
    },
    usedCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

// Either percent or rupees is required, not both zero/empty
CouponSchema.pre("validate", function (next) {
  if (
    (this.percent == null || this.percent === 0) &&
    (this.rupees == null || this.rupees === 0)
  ) {
    return next(new Error("Either percent or rupees must be provided"));
  }
  next();
});

const Coupon = Mongoose.model("Coupon", CouponSchema);
module.exports = Coupon;
