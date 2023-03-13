import { Request, Response } from "express";
import Product from "models/product";

const generateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.sendStatus(404);
    }
    const { size_ids, color_ids } = product;
    const stock = product.stock;
    const newStock = [];
    for (let i = 0; i < size_ids.length; i++) {
      for (let j = 0; j < color_ids.length; j++) {
        const size_id = size_ids[i];
        const color_id = color_ids[j];
        const existStock = stock.find(
          (item) => item.size_id === size_id && item.color_id === color_id
        );
        if (existStock) {
          newStock.push(existStock);
        } else {
          newStock.push({
            size_id,
            color_id,
            quantity: 0,
          });
        }
      }
    }
    await product.updateOne({ stock: newStock });
    return res.status(200).json({ stock: newStock });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err });
  }
};

export default generateStock;
