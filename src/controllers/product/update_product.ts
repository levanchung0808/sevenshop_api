import { Request, Response } from "express";
import Product, { IProduct } from "models/product";
import User from "models/user";
import { getNow, validateFields } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateProduct = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
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
      stock,
    }: IProduct = req.body;
    const product = await Product.findById(id);

    if (!product) return res.sendStatus(404);
    if (!user) return res.sendStatus(403);

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
        stock,
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
        { name: "stock", type: "arrayObject" },
      ]
    );
    if (validateFieldsResult)
      return res.status(400).json({ message: validateFieldsResult });

    const existingProduct = await Product.findOne({ name });
    if (existingProduct && existingProduct._id.toString() !== id) {
      return res
        .status(409)
        .json({ message: "Product with this name already exists" });
    }

    const fieldsEdited = [];
    if (name && name !== product.name) fieldsEdited.push("name");
    if (price && price !== product.price) fieldsEdited.push("price");
    if (price_sale && price_sale !== product.price_sale)
      fieldsEdited.push("price_sale");
    if (description && description !== product.description)
      fieldsEdited.push("description");
    if (images && images !== product.images) fieldsEdited.push("images");
    if (JSON.stringify(category_ids) !== JSON.stringify(product.category_ids))
      fieldsEdited.push("category_ids");
    if (JSON.stringify(color_ids) !== JSON.stringify(product.color_ids))
      fieldsEdited.push("color_ids");
    if (JSON.stringify(size_ids) !== JSON.stringify(product.size_ids))
      fieldsEdited.push("size_ids");
    if (status && status !== product.status) fieldsEdited.push("status");
    if (stock && stock !== product.stock) fieldsEdited.push("stock");

    if (!fieldsEdited.length) return res.sendStatus(304);

    const newProduct: IProduct = {
      ...product.toObject(),
      name: name ?? product.name,
      price: price ?? product.price,
      price_sale: price_sale ?? product.price_sale,
      description: description ?? product.description,
      images: images ?? product.images,
      category_ids: category_ids ?? product.category_ids,
      color_ids: color_ids ?? product.color_ids,
      size_ids: size_ids ?? product.size_ids,
      status: status ?? product.status,
      stock: stock ?? product.stock,
      modify: [
        ...product.modify,
        {
          action: `Update fields: ${fieldsEdited.join(", ")} by ${user.email}`,
          date: getNow(),
        },
      ],
    };

    await product.updateOne(newProduct);
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateProduct;
