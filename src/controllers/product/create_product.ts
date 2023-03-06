import { Request, Response } from "express";
import Product, { IProduct } from "models/product";
import User from "models/user";
import { getDateNow } from "utils/common";
import { getIdFromReq } from "utils/token";

const createProduct = async (req: Request, res: Response) => {
  try {
    const { id: id_user } = getIdFromReq(req);
    const {
      name,
      price,
      description,
      images,
      categories,
      price_sale,
      colors,
      sizes,
      status,
    }: IProduct = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Missing name, description" });
    }
    const user = await User.findById(id_user);
    const newProduct: IProduct = {
      name: name,
      description: description,
      images: images,
      categories: categories,
      stock: [],
      price_sale: price_sale,
      status: status,
      price: price,
      colors: colors,
      sizes: sizes,
      created_at: getDateNow(),
      created_by: `${user?.email}`,
      modify: [],
    };
    newProduct.modify.push({
      action: `Create by ${user?.email}`,
      date: getDateNow(),
    });
    const product = new Product(newProduct);
    await product.save();
    return res.status(200).json({ id: product._id });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createProduct;
