import { validateAdmin, validateToken } from "middleware/validate";
import { Router } from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  // getProductByID,
  // recentProduct,
  // addProductFavorites,
  // removeProductFavorites,
  // getProductsRecent,
  // getProductsSale,
} from "controllers/product";

const router = Router();

//User Routes (role==='USER')
router.get("/", getProducts);
// router.get("/:id", validateToken, getProductByID);
// router.post("/recentProduct/:id", validateToken, recentProduct);
// router.post("/addProductFavorites/:id", validateToken, addProductFavorites);
// router.post(
//   "/removeProductFavorites/:id",
//   validateToken,
//   removeProductFavorites
// );
// router.get("/getProducts/recent", validateToken, getProductsRecent);
// router.get("/getProducts/sale", getProductsSale);

//User Routes (role==='ADMIN')
router.post("/", validateAdmin, createProduct);
router.post("/update/:id", validateAdmin, updateProduct);
router.post("/delete/:id", validateAdmin, deleteProduct);

export default router;
