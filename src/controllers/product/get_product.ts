import { getRoleFromReq } from 'utils/token';
import { Request, Response } from "express";
import { ROLE } from "constants/user";
import { STATUS_PRODUCT } from "constants/product";
import Product, { IProduct } from "models/product";

const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = getRoleFromReq(req);
    const product: IProduct | null = await Product.findById(id);
    if (!product) {
      return res.sendStatus(404);
    }
    if (role !== ROLE.admin) {
      if (product.status !== STATUS_PRODUCT.inactive) {
        return res.status(200).json({});
      }
    }

    return res.status(200).json(product);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default getProductById;
