import { Request, Response } from "express";
import Product, { IProduct } from "models/product";
import User from "models/user";
import { getNow } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateProduct = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const { id } = req.params;
    const {
      name,
      price,
      description,
      images,
      price_sale,
      categories,
      status,
      stock,
      colors,
      sizes,
    }: IProduct = req.body;
    const product = await Product.findById(id);
    const user = await User.findById(id_user);
    if (!product) return res.sendStatus(404);
    if (!user) return res.sendStatus(403);
    const newProduct: IProduct = {
      ...product,
      name: name ?? product.name,
      price: price ?? product.price,
      description: description ?? product.description,
      images: images ?? product.images,
      categories: categories ?? product.categories,
      stock: stock ?? product.stock,
      price_sale: price_sale ?? product.price_sale,
      status: status ?? product.status,
      colors: colors ?? product.colors,
      sizes: sizes ?? product.sizes,
      modify: [
        ...product.modify,
        { action: `Update by ${user.email}`, date: getNow() },
      ],
    };
    if (JSON.stringify(newProduct) === JSON.stringify(product))
      return res.sendStatus(304);
    Object.assign(product, newProduct);
    await product.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateProduct;
