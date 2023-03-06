import { Request, Response } from "express";
import Log from "libraries/log";
import Category, { ICategory } from "models/category";
import User from "models/user";
import { getNow } from "utils/common";
import { getIdFromReq } from "utils/token";

const createCategory = async (req: Request, res: Response) => {
  try {
    const { id: id_user } = getIdFromReq(req);
    const user = await User.findById(id_user);
    const { name, description, image }: ICategory = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: "Missing name, description" });
    }
    const newCategory: ICategory = {
      name: name,
      description: description,
      image: image ? image : "",
      created_at: getNow(),
      created_by: `${user?.email}`,
      modify: [],
    };
    newCategory.modify.push({
      action: `Create by ${user?.email}`,
      date: getNow(),
    });
    const category = new Category(newCategory);
    await category.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createCategory;
