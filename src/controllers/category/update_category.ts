import { Request, Response } from "express";
import Log from "libraries/log";
import Category, { ICategory } from "models/category";
import User from "models/user";
import { getDateNow } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id: id_user } = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
    Log.info(`Update category with id: ${id}`);
    const { name, description, image }: ICategory = req.body;
    if (!name && !description && !image) {
      return res
        .status(400)
        .json({ message: "Missing name, description or image" });
    }
    const category = await Category.findById(id);
    if (!category) {
      return res.sendStatus(404);
    }
    const newCategory: ICategory = {
      name: "",
      description: "",
      image: "",
      created_at: category.created_at,
      created_by: category.created_by,
      modify: [],
    };
    if (name) newCategory.name = name;
    if (description) newCategory.description = description;
    if (image) newCategory.image = image;
    newCategory.modify.push({
      action: `Update by ${user?.email}`,
      date: getDateNow(),
    });
    await Object.assign(category, newCategory);
    await category.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateCategory;
