import { Request, Response } from "express";
import Product, { IProduct } from "models/product";
import User from "models/user";
import { getNow, validateFields } from "utils/common";
import { getIdFromReq } from "utils/token";

const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      price,
      price_sale,
      description,
      images,
      category_ids,
      color_ids,
      size_ids,
      status,
    }: IProduct = req.body;
    const validateFieldsResult = validateFields(
      {
        name,
        price,
        price_sale,
        description,
        images,
        category_ids,
        color_ids,
        size_ids,
        status,
      },
      [
        { name: "name", type: "string", required: true },
        { name: "price", type: "number", required: true },
        { name: "price_sale", type: "number" },
        { name: "description", type: "string", required: true },
        { name: "images", type: "arrayString" },
        { name: "category_ids", type: "arrayString", required: true },
        { name: "color_ids", type: "arrayString", required: true },
        { name: "size_ids", type: "arrayString", required: true },
        { name: "status", type: "string" },
      ]
    );
    if (validateFieldsResult)
      return res.status(400).json({ message: validateFieldsResult });

    const user = await User.findById(getIdFromReq(req));
    if (!user) return res.sendStatus(403);

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res
        .status(409)
        .json({ message: "Product with this name already exists" });
    }
    const product = new Product({
      name,
      description,
      images,
      category_ids,
      color_ids,
      size_ids,
      price,
      price_sale,
      status,
      stock: [],
      created_at: getNow(),
      created_by: `${user.email}`,
      modify: [{ action: `Create by ${user.email}`, date: getNow() }],
    });
    await product.save();
    return res.status(200).json({ id: product._id });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createProduct;
