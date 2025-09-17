const express = require("express");
const AdminRouter = express.Router();
const {
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
  deleteCategory
} = require("../controllers/AdminPannel");
const adminMiddleware = require("../middleware/adminMiddleware");

// Existing routes
AdminRouter.post("/getsignature", adminMiddleware, Getsignature);
AdminRouter.post("/saveproduct", adminMiddleware, SaveProduct);
AdminRouter.post("/deleteproduct", adminMiddleware, DeleteProduct);
AdminRouter.post("/addbanner", adminMiddleware, AddBanner);
AdminRouter.post("/deletebanner", adminMiddleware, deleteBanner);
AdminRouter.post("/addcategory", adminMiddleware, AddCategory);
AdminRouter.post("/deletecategory", adminMiddleware, deleteCategory);
AdminRouter.get("/getproducts", adminMiddleware, getProducts);
AdminRouter.get("/getcategories", adminMiddleware, getCategories);

// new added by soham - Routes for admin dashboard data
AdminRouter.get("/users", adminMiddleware, getUsers);
AdminRouter.get("/orders", adminMiddleware, getOrders);
AdminRouter.get("/carts", adminMiddleware, getCarts);

module.exports = AdminRouter;