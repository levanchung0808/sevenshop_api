import { Request, Response } from "express";
import Product, { IProduct } from "models/product";

const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product: IProduct | null = await Product.findById(id);
    if (!product) {
      return res.sendStatus(404);
    }
    return res.status(200).json(product);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default getProductById;
