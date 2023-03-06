import { Request, Response } from "express";
import Product, { IProduct } from "models/product";

const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "name";
    const startIndex = (page - 1) * limit;
    const total = await Product.countDocuments();

    const products: IProduct[] = await Product.find()
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    const results = {
      total: total,
      page: page,
      limit: limit,
      results: products,
    };
    return res.json(results);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default getProducts;
