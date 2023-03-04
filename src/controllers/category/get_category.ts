import { Request, Response } from "express";
import Category, { ICategory } from "models/category";

const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category: ICategory | null = await Category.findById(id);
    if (!category) {
      return res.sendStatus(404);
    }
    return res.json(category);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default getCategoryById;
