import { Request, Response } from "express";
import { IProductCart } from "interfaces/cart";
import Cart from "models/cart";
import User from "models/user";
import { getIdFromReq } from "utils/token";

const addToCart = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const user = await User.findById(id_user);
    if (!user) {
      return res.sendStatus(403);
    }
    const cart = await Cart.findById(user.cart_id);
    if (!cart) {
      return res.sendStatus(404);
    }
    const { product_id, quantity, color_id, size_id }: IProductCart = req.body;
    if (!product_id || !quantity) {
      return res.status(400).json({ message: "Missing product_id, quantity" });
    }
    const product = cart.products.find(
      (product) => product.product_id === product_id
    );
    if (product) {
      product.quantity += quantity;
    } else {
      cart.products.push({ product_id, quantity, color_id, size_id });
    }
    await cart.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default addToCart;
