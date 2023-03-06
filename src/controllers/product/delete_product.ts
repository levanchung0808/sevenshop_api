import { Request, Response } from "express";
import Log from "libraries/log";
import Category from "models/category";
import Product from "models/product";
import { getIdFromReq } from "utils/token";

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id: id_user } = getIdFromReq(req);
    const { id } = req.params;
    Log.info(`Delete product with id: ${id}`);
    const product = await Product.findById(id);
    if (!product) {
      return res.sendStatus(404);
    }
    if (product.created_by.toString() !== id_user) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await product.remove();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default deleteProduct;
