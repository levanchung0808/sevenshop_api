import { Request, Response } from "express";
import Category, { ICategory } from "models/category";
import User from "models/user";
import { getNow, updateFieldIfNew } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateCategory = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
    const { name, description, image }: ICategory = req.body;
    const category = await Category.findById(id);
    if (!category) {
      return res.sendStatus(404);
    }
    if (!user) {
      return res.sendStatus(403);
    }
    if (
      category?.name === name &&
      category?.description === description &&
      category?.image === image
    ) {
      return res.sendStatus(304);
    }
    const newCategory: ICategory = {
      ...category,
    };
    updateFieldIfNew(newCategory, "name", name);
    updateFieldIfNew(newCategory, "description", description);
    updateFieldIfNew(newCategory, "image", image);
    newCategory.modify.push({
      action: `Update by ${user.email}`,
      date: getNow(),
    });
    await Object.assign(category, newCategory);
    await category.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateCategory;
