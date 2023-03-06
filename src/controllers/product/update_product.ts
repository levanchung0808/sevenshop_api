import { Request, Response } from "express";
import Product, { IProduct } from "models/product";
import User from "models/user";
import { getDateNow } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id: id_user } = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
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
    if (!product) {
      return res.sendStatus(404);
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
      name: product.name,
      description: product.description,
      images: product.images,
      categories: product.categories,
      stock: product.stock,
      price_sale: product.price_sale,
      status: product.status,
      price: product.price,
      colors: product.colors,
      sizes: product.sizes,
      created_at: product.created_at,
      created_by: product.created_by,
      modify: product.modify,
    };
    if (name) {
      newProduct.name = name;
    }
    if (price) {
      newProduct.price = price;
    }
    if (description) {
      newProduct.description = description;
    }
    if (images) {
      newProduct.images = images;
    }
    if (categories) {
      newProduct.categories = categories;
    }
    if (stock) {
      newProduct.stock = stock;
    }
    if (colors) {
      newProduct.colors = colors;
    }
    if (sizes) {
      newProduct.sizes = sizes;
    }
    if (price_sale) {
      newProduct.price_sale = price_sale;
    }
    if (status) {
      newProduct.status = status;
    }
    newProduct.modify.push({
      action: `Update by ${user?.email}`,
      date: getDateNow(),
    });
    await Object.assign(product, newProduct);
    await product.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateProduct;
