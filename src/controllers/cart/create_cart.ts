import Cart from "models/cart";
import { getNow } from "utils/common";

const createCart = async (user_id: string) => {
    const cart = await Cart.create({
        user_id,
        products: [],
        created_at: getNow(),
        created_by: "system",
        modify: [],
    });
    return cart._id;
};

export default createCart;
