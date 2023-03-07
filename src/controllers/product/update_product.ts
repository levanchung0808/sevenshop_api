import { Request, Response } from "express";
import Product, { IProduct } from "models/product";
import User from "models/user";
import { getNow, updateFieldIfNew } from "utils/common";
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
    if (!product) {
      return res.sendStatus(404);
    }
    if (!user) {
      return res.sendStatus(403);
    }
    if (
      product.name === name &&
      product.price === price &&
      product.description === description &&
      product.images === images &&
      product.categories === categories &&
      product.stock === stock &&
      product.price_sale === price_sale &&
      product.status === status &&
      product.colors === colors &&
      product.sizes === sizes
    ) {
      return res.sendStatus(304);
    }
    const newProduct: IProduct = {
      ...product,
    };
    updateFieldIfNew(newProduct, "name", name);
    updateFieldIfNew(newProduct, "price", price);
    updateFieldIfNew(newProduct, "description", description);
    updateFieldIfNew(newProduct, "images", images);
    updateFieldIfNew(newProduct, "categories", categories);
    updateFieldIfNew(newProduct, "stock", stock);
    updateFieldIfNew(newProduct, "price_sale", price_sale);
    updateFieldIfNew(newProduct, "status", status);
    updateFieldIfNew(newProduct, "colors", colors);
    updateFieldIfNew(newProduct, "sizes", sizes); 
    newProduct.modify.push({
      action: `Update by ${user.email}`,
      date: getNow(),
    });
    await Object.assign(product, newProduct);
    await product.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateProduct;
