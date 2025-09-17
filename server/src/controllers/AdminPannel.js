const cloudinary = require("../config/Cloudinary");
const Product = require("../models/AddPost");
const Banners = require("../models/AddBanner");
const Category = require("../models/AddCategory");
const User = require("../models/user");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const slugify = require("slugify");

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
      Product_public_id: req.body.Product_public_id,
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
    const { _id, Product_public_id } = req.body;
    const cloudinary_Delete_Result = await cloudinary.uploader.destroy(
      Product_public_id
    );
    if (!cloudinary_Delete_Result)
      throw new Error("delete faild from cloudinary try again");

    const post_Delete = await Product.findByIdAndDelete(_id);
    if (!post_Delete) throw new Error("error ecoured Try Again!");

    const responseData = await Product.find({});

    res.status(200).json({
      Products: responseData,
      Message: "Deleted Succesfully!",
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
};
