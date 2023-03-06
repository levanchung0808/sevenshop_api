import { Request, Response } from "express";
import Product from "models/product";

const generateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.sendStatus(404);
    }
    const colors = product.colors;
    const sizes = product.sizes;
    const stock = [];
    for (let i = 0; i < colors.length; i++) {
      for (let j = 0; j < sizes.length; j++) {
        stock.push({
          color_id: colors[i]._id,
          size_id: sizes[j]._id,
          quantity: 0,
        });
      }
    }
    product.stock = stock;
    await product.save();
    return res.status(200).json(product.stock);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default generateStock;
