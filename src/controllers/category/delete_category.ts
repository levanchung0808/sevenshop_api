import { Request, Response } from "express";
import Log from "libraries/log";
import Category from "models/category";
import { getIdFromReq } from "utils/token";

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id: id_user } = getIdFromReq(req);
    const { id } = req.params;
    Log.info(`Delete category with id: ${id}`);
    const category = await Category.findById(id);
    if (!category) {
      return res.sendStatus(404);
    }
    if (category.created_by.toString() !== id_user) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await category.remove();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default deleteCategory;
