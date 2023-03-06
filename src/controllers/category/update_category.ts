import { Request, Response } from "express";
import Category, { ICategory } from "models/category";
import User from "models/user";
import { getNow } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id: id_user } = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
    const { name, description, image }: ICategory = req.body;
    const category = await Category.findById(id);
    if (!category) {
      return res.sendStatus(404);
    }
    if (
      category?.name === name &&
      category?.description === description &&
      category?.image === image
    ) {
      return res.sendStatus(304);
    }
    const newCategory: ICategory = {
      name: category.name,
      description: category.description,
      image: category.image,
      created_at: category.created_at,
      created_by: category.created_by,
      modify: category.modify,
    };
    if (name) newCategory.name = name;
    if (description) newCategory.description = description;
    if (image) newCategory.image = image;
    newCategory.modify.push({
      action: `Update by ${user?.email}`,
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
