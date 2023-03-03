import { IProduct } from "models/product";
import { Request, Response } from "express";
import Product from "models/product";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      price,
      description,
      images,
      categories,
      stock,
      price_sale,
      status,
    }: IProduct = req.body;

    const product = new Product({
      name,
      price,
      description,
      images,
      categories,
      stock,
      price_sale,
      status,
    });
    await product.save();
    return res.status(200).json({ message: "Create product successfully" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  const { offset, limit } = req.query;
  const products = await Product.find()
    .skip(Number(offset))
    .limit(Number(limit));
  return res.status(200).json({ products });
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      description,
      images,
      categories,
      stock,
      price_sale,
      status,
    }: IProduct = req.body;

    const product = await Product.findById({ _id: id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    if (images) product.images = images;
    if (categories) product.categories = categories;
    if (stock) product.stock = stock;
    if (price_sale) product.price_sale = price_sale;
    if (status) product.status = status;
    await product.save();
    return res.status(200).json({ message: "Update product successfully" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await Product.findById({ _id: id });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  await product.remove();
  return res.status(200).json({ message: "Delete product successfully" });
};
