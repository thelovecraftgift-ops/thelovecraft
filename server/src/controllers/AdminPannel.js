const cloudinary = require("../config/Cloudinary");
const Product = require("../models/AddPost");
const Banners = require("../models/AddBanner");
const Category = require("../models/AddCategory");
const User = require("../models/user");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const slugify = require("slugify");
const Coupon = require("../models/coupon");
const mongoose = require("mongoose")
// const cloudinary = require("../config/Cloudinary");


const Getsignature = async (req, res) => {
  try {
    const {
      Product_name,
      Product_category,
      cloudInstance = "primary",
    } = req.body;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const public_id = `thelovecraft/Product/${Product_category}/${Product_name}_${timestamp}`;

    const uploadparams = {
      timestamp,
      public_id,
    };

    // Choose which Cloudinary instance to use
    const cloudName =
      cloudInstance === "secondary"
        ? process.env.CLOUDINARY_NAME2
        : process.env.CLOUDINARY_NAME;
    const apiKey =
      cloudInstance === "secondary"
        ? process.env.CLOUDINARY_API_KEY2
        : process.env.CLOUDINARY_API_KEY;
    const apiSecret =
      cloudInstance === "secondary"
        ? process.env.CLOUDINARY_API_SECRATE2
        : process.env.CLOUDINARY_API_SECRATE;

    const signature = cloudinary.utils.api_sign_request(
      uploadparams,
      apiSecret
    );

    const response = {
      signature,
      timestamp,
      public_id: public_id,
      cloud_name: cloudName,
      CLOUDINARY_API_KEY: apiKey,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };

    res.json({
      message: "Request fulfilled",
      signature: response,
    });
  } catch (e) {
    res.status(500).json({ Message: "Failed To Upload Reason: " + e.message });
  }
};


const SaveProduct = async (req, res) => {
  try {
    // ✅ Add debug logging 
    console.log('🔍 BACKEND RECEIVED:', req.body);
    console.log('🔍 Hamper_price:', req.body.Hamper_price);
    console.log('🔍 isHamper_product:', req.body.isHamper_product);

    if (!req.body.Product_name || req.body.Product_name.length < 2) {
      return res
        .status(400)
        .json({ error: "Product name must be at least 2 characters" });
    }

    if (!req.body.Product_price || req.body.Product_price < 10) {
      return res.status(400).json({ error: "Minimum price is ₹10" });
    }

    // ✅ Validate hamper pricing if it's a hamper product
    if (req.body.isHamper_product && req.body.Hamper_price) {
      const regularPrice = parseFloat(req.body.Product_price);
      const hamperPrice = parseFloat(req.body.Hamper_price);
      
      if (hamperPrice <= 0) {
        return res.status(400).json({ error: "Hamper price must be greater than 0" });
      }
      
      if (hamperPrice >= regularPrice) {
        return res.status(400).json({ error: "Hamper price must be less than regular price" });
      }
    }

    // Verify that the category exists
    const category = await Category.findById(req.body.Product_category);
    if (!category) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // ✅ FIXED: Include hamper fields in the new product 
    const newProduct = new Product({
      Product_name: req.body.Product_name,
      Product_discription: req.body.Product_discription,
      Product_price: req.body.Product_price,
      Hamper_price: req.body.Hamper_price || 0, // ✅ Add hamper price
      isHamper_product: req.body.isHamper_product || false, // ✅ Add hamper flag
      Product_image: req.body.Product_image || [],
      Product_category: req.body.Product_category,
      Product_available: req.body.Product_available !== false,
      Product_public_id: req.body.Product_public_id || "uvbuisdionwionioqnc iwoncow",
      Product_slug: category.slug,
    });

    const savedProduct = await newProduct.save();

    // ✅ Add debug logging for saved product
    console.log('🔍 SAVED PRODUCT:', savedProduct);
    console.log('🔍 Saved Hamper_price:', savedProduct.Hamper_price);
    console.log('🔍 Saved isHamper_product:', savedProduct.isHamper_product);

    // Populate the category details before sending response
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("Product_category", "category category_description")
      .lean();

    // Transform the response to include category name
    const transformedProduct = {
      ...populatedProduct,
      Product_category:
        populatedProduct.Product_category?.category ||
        populatedProduct.Product_category,
    };

    res.status(201).json({
      message: "Product Saved",
      product: transformedProduct,
    });
  } catch (e) {
    console.error('SaveProduct Error:', e);
    res.status(500).json({ message: "Failed to save Because: " + e.message });
  }
};


const DeleteProduct = async (req, res) => {
  try {
    const { _id } = req.body;
    
    const find = await Product.findById(_id);
    const ImageLinksArray = find.Product_image;

    // Extract public IDs from image URLs and delete from Cloudinary
    for (const imageUrl of ImageLinksArray) {
      // Extract public ID from Cloudinary URL
      // URL format: https://res.cloudinary.com/diypnkid6/image/upload/v1759769713/AnokhiAda/Product/general/upload_1759769645113_1759769694.jpg
      const urlParts = imageUrl.split('/');
      
      // Find the index where 'upload' appears and get everything after it
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1) {
        // Get the path after 'upload' and remove the file extension
        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
        const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ""); // Remove file extension
        
        console.log(`Deleting image with public ID: ${publicId}`);
        
        // Delete image from Cloudinary
        const cloudinary_Delete_Result = await cloudinary.uploader.destroy(publicId);
        
        if (cloudinary_Delete_Result.result !== 'ok') {
          console.warn(`Failed to delete image: ${publicId}`);
        }
      }
    }

    // Delete the product from database
    const post_Delete = await Product.findByIdAndDelete(_id);
    if (!post_Delete) throw new Error("Error occurred! Try Again!");

    const responseData = await Product.find({});

    res.status(200).json({
      Products: responseData,
      Message: "Deleted Successfully!",
    });
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
};

const AddBanner = async (req, res) => {
  try {
    const { BannerUrl, BannerTitle, Banner_public_id } = req.body;
    if (!BannerUrl || !BannerTitle) throw new Error("inputs are Empty");
    const AddBanner = await Banners.create(req.body);
    const response = await Banners.find({});
    res.status(201).json({
      Banners: response,
      message: "Banner Posted Succesfully!",
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { _id, Banner_public_id } = req.body;
    const cloudinary_Delete_Result = await cloudinary.uploader.destroy(
      Banner_public_id
    );
    if (!cloudinary_Delete_Result)
      throw new Error("delete faild from cloudinary try again");

    const post_Delete = await Banners.findByIdAndDelete(_id);
    if (!post_Delete) throw new Error("error ecoured Try Again!");

    const bannerRes = await Banners.find({});

    res.status(200).json({
      Banners: bannerRes,
      Message: "Deleted Succesfully!",
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).send(err.message);
  }
};

const AddCategory = async (req, res) => {
  try {
    const { category, category_image, category_description } = req.body;

    if (!category || !category_image || !category_description) {
      throw new Error("All category fields are required");
    }

    const slug = slugify(category, { lower: true });

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({
      category,
      category_image,
      category_description,
      slug,
    });

    const saved = await newCategory.save();

    res.status(200).json({
      message: "Category created successfully",
      category: saved,
    });
  } catch (e) {
    console.log("AddCategory error:", e);
    res.status(500).json({ message: "Internal server error: " + e.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { _id } = req.body;

    // Check if category exists
    const category = await Category.findById(_id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete category image from cloudinary if it exists
    if (category.category_image) {
      try {
        const publicId = category.category_image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error(
          "Failed to delete image from cloudinary:",
          cloudinaryError
        );
        // Continue with category deletion even if image deletion fails
      }
    }

    // Delete the category
    await Category.findByIdAndDelete(_id);

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Delete Category Error:", err);
    res.status(500).json({
      message: "Failed to delete category: " + err.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};
    if (category) {
      filter = { Product_slug: category };
    }

    const response = await Product.find(filter)
      .populate("Product_category", "category category_description")
      .lean();

    const transformedProducts = response.map((product) => ({
      ...product,
      Product_category:
        product.Product_category?.category || product.Product_category,
    }));

    res.json({
      message: "Products fetched successfully",
      product: transformedProducts,
    });
  } catch (e) {
    res.status(500).json({
      message: "Internal server error: " + e.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const response = await Category.find({});
    res.json({
      message: "Categories fetched successfully",
      categories: response,
    });
  } catch (e) {
    res.status(500).json({
      message: "internal server error: " + e.message,
    });
  }
};

// new added by soham - Get all users for admin dashboard
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({
      message: "Users fetched successfully",
      users,
    });
  } catch (e) {
    res.status(500).json({
      message: "internal server error: " + e.message,
    });
  }
};

// new added by soham - Get all orders with user details for admin dashboard
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "firstName email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (e) {
    res.status(500).json({
      message: "internal server error: " + e.message,
    });
  }
};

// new added by soham - Get all active carts with user and product details for admin dashboard
const getCarts = async (req, res) => {
  try {
    const carts = await Cart.find({})
      .populate("userId", "firstName email")
      .populate("items.productId", "Product_name Product_price")
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      message: "Carts fetched successfully",
      carts,
    });
  } catch (e) {
    res.status(500).json({
      message: "internal server error: " + e.message,
    });
  }
};


const outOFstock = async(req,res)=>{
  try{
    const { id , status } = req.body;

    // 1. Field missing check (Corrected from previous fix)
    if(!id || !("status" in req.body)) throw new Error("Field missing!");
    
    // 2. ✅ FIX: Product find karte samay 'await' ka use karein.
    const productDoc = await Product.findById(id); 
    
    if(!productDoc) throw new Error("Product does not exist");
    
    // 3. Status update karein
    productDoc.Product_available = status;
    
    // 4. ✅ FIX: 'productDoc' (jo ki ek Mongoose Document hai) par save() call karein aur 'await' use karein.
    await productDoc.save();
    
    res.status(200).send("Updated successfully");
  }catch(e){
    res.status(400).json({
      message:"Something went wrong! "+e.message
    })
  }
}




const extractPublicId = (url) => {
  try {
    if (!url) return null;
    const clean = url.split("?")[0];
    const idx = clean.indexOf("/upload/");
    if (idx === -1) return null;
    const rest = clean.substring(idx + "/upload/".length);
    const parts = rest.split("/");
    if (parts[0] && /^v\d+$/.test(parts[0])) parts.shift(); // drop version
    const last = parts.pop();
    if (!last) return null;
    const noExt = last.replace(/\.[a-z0-9]+$/i, "");
    parts.push(noExt);
    const publicId = parts.join("/");
    return publicId || null;
  } catch {
    return null;
  }
};




const updateCategory = async (req, res) => {
  try {
    console.log("updateCategory body:", req.body);
    const { id, image } = req.body || {};

    // Validate inputs
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id", status: "failed" });
    }
    if (!image || typeof image !== "string") {
      return res.status(400).json({ message: "Invalid image", status: "failed" });
    }

    // Find category
    const doc = await Category.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Category not found", status: "failed" });
    }

    // If same URL, no work needed
    if (doc.category_image === image) {
      return res.status(200).json({ message: "No changes", status: "success" });
    }

    // Delete old Cloudinary asset (non-fatal if already gone)
    if (doc.category_image) {
      const oldPublicId = extractPublicId(doc.category_image);
      if (oldPublicId) {
        // cloudinary exported as v2 directly -> use cloudinary.uploader
        const del = await cloudinary.uploader.destroy(oldPublicId, { invalidate: true });
        const ok = ["ok", "not found", "gone"];
        if (!ok.includes(del?.result)) {
          return res.status(502).json({ message: "Failed to delete old image", status: "failed" });
        }
      }
    }

    // Save new image URL only (text fields untouched)
    doc.category_image = image;
    await doc.save();

    return res.status(200).json({
      message: "Image updated",
      status: "success",
      category: {
        _id: doc._id,
        category: doc.category,
        category_image: doc.category_image,
        slug: doc.slug
      }
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Internal error", status: "failed" });
  }
};



const updateProduct = async (req,res)=>{
  try{

    const {id , name , description , price , hamperPrice}  = req.body;
    const response = await Product.findById(id);
    if(!response) throw new Error("invalid product");
    response.Product_name = name
    response.Product_discription = description
    response.Product_price = price
    response.Hamper_price = hamperPrice

    response.save();
    res.status(200).json({
      message:"product updated succesfully",
      status:"success"
    })
  }catch (e) {
    res.status(500).json({
      message: e.message,
      status: "failed"
    });
}
}
function computeDiscount({ subtotal, couponDoc }) {
  if (!couponDoc) {
    return { ok: false, reason: "Coupon not found" };
  }

  if (!couponDoc.active) {
    return { ok: false, reason: "Coupon is inactive" };
  }

  const now = new Date();
  if (couponDoc.startsAt && now < couponDoc.startsAt) {
    return { ok: false, reason: "Coupon not started yet" };
  }
  if (couponDoc.expiresAt && now > couponDoc.expiresAt) {
    return { ok: false, reason: "Coupon expired" };
  }
  if (couponDoc.usageLimit && couponDoc.usedCount >= couponDoc.usageLimit) {
    return { ok: false, reason: "Coupon usage limit reached" };
  }
  if (subtotal < (couponDoc.minOrder || 0)) {
    return { ok: false, reason: `Minimum order ₹${couponDoc.minOrder} not met` };
  }

  let discount = 0;
  if (couponDoc.percent) {
    discount = (couponDoc.percent / 100) * subtotal;
    if (couponDoc.maxDiscount != null && couponDoc.maxDiscount > 0) {
      discount = Math.min(discount, couponDoc.maxDiscount);
    }
  } else if (couponDoc.rupees) {
    discount = couponDoc.rupees;
  }

  discount = Math.max(0, Math.min(discount, subtotal));
  const totalAfter = Math.max(0, subtotal - discount);

  return {
    ok: true,
    discount: Math.round(discount),
    totalAfter: Math.round(totalAfter),
  };
}

const genCoupon = async (req, res) => {
  try {
    const {
      code,
      percent,
      rupees,
      minOrder,
      maxDiscount,
      startsAt,
      expiresAt,
      active = true,
      usageLimit,
    } = req.body;

    if (!code) throw new Error("code is required");

    // normalize code
    const payload = {
      code: String(code).trim().toUpperCase(),
      percent: percent ?? null,
      rupees: rupees ?? null,
      minOrder: minOrder ?? 0,
      maxDiscount: maxDiscount ?? null,
      startsAt: startsAt ? new Date(startsAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: !!active,
      usageLimit: usageLimit ?? null,
    };

    const created = await Coupon.create(payload);
    res.status(201).json({
      message: "Coupon created successfully",
      data: created,
    });
  } catch (e) {
    res.status(400).json({
      message: e.message,
      status: "failed",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) throw new Error("id is required");
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) throw new Error("Coupon not found");
    res.status(200).json({
      message: "Coupon deleted successfully",
    });
  } catch (e) {
    res.status(400).json({
      message: e.message,
      status: "failed",
    });
  }
};

// Validate coupon against subtotal and return discount
const checkCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) throw new Error("code is required");
    if (subtotal == null || Number.isNaN(Number(subtotal))) {
      throw new Error("valid subtotal is required");
    }

    const doc = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
    const result = computeDiscount({ subtotal: Number(subtotal), couponDoc: doc });

    if (!result.ok) {
      return res.status(400).json({
        message: result.reason || "invalid coupon",
        status: "failed",
      });
    }

    res.status(200).json({
      message: "Coupon valid",
      code: String(code).trim().toUpperCase(),
      discount: result.discount,
      totalAfter: result.totalAfter,
      status: "ok",
    });
  } catch (e) {
    res.status(400).json({
      message: e.message || "invalid coupon",
      status: "failed",
    });
  }
};

// Optionally increment usage when an order is placed successfully
const incrementCouponUsage = async (code) => {
  if (!code) return;
  await Coupon.findOneAndUpdate(
    { code: String(code).trim().toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
};

const getCoupon = async (req, res) => {
  try {
    const data = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      data,
      message: "All coupons",
    });
  } catch (e) {
    res.status(400).json({
      message: e.message,
      status: "failed",
    });
  }
};

module.exports = {
  Getsignature,
  SaveProduct,
  DeleteProduct,
  AddBanner,
  deleteBanner,
  AddCategory,
  getProducts,
  getCategories,
  getUsers,
  getOrders,
  getCarts,
  deleteCategory,
  outOFstock,
  updateCategory,
  updateProduct,
  getCoupon,
  genCoupon,
  deleteCoupon,
  checkCoupon,
  incrementCouponUsage
};
