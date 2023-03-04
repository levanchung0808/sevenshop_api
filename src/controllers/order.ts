import Product from "models/product";
import Order, { IOrder, PaymentType, ProductType, STATUS } from "models/order";
import moment from "moment";
import { Request, Response } from "express";
import User from "models/user";
import { getIdFromReq, parseJwt, tokenGen } from "utils/token";
import { Types } from "mongoose";

export const getAll = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find();
    res
      .status(200)
      .json({ message: "Get Orders Successfully", result: orders });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const getOrdersByUserID = async (req: Request, res: Response) => {
  try {
    const idUser = getIdFromReq(req);
    const { order_type } = req.query;
    let orders: (IOrder & { _id: Types.ObjectId })[] = [];
    //order_type 0 GET ALL, 1 CART, 2 DELIVERY, 3 SUCCESSFULLY, 4 CANCEL
    if (Number(order_type) === 0) {
      orders = await Order.aggregate([
        {
          $project: {
            code: 1,
            total: 1,
            user_id: 1,
            products: 1,
            order_type: 1,
            payment_type: 1,
            voucher_type: 1,
          },
        },
      ]);
    } else if (Number(order_type) === STATUS.CART) {
      orders = await Order.find({ user_id: idUser, order_type: STATUS.CART });
    } else if (Number(order_type) === STATUS.DELIVERY) {
      orders = await Order.find({
        user_id: idUser,
        order_type: STATUS.DELIVERY,
      });
    } else if (Number(order_type) === STATUS.SUCCESSFULLY) {
      orders = await Order.find({
        user_id: idUser,
        order_type: STATUS.SUCCESSFULLY,
      });
    } else if (Number(order_type) === STATUS.CANCEL) {
      orders = await Order.find({
        user_id: idUser,
        order_type: STATUS.CANCEL,
      });
    }

    res
      .status(200)
      .json({ message: "Get Orders By User ID Successfully", result: orders });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { product_id, color_id, size_id, quantity, image } = req.body;
    const idUser = getIdFromReq(req);
    const user = await User.findById(idUser);
    const product = await Product.findById(product_id);

    if (!product) {
      res.status(500).json({ message: "Product not found" });
    }

    const orderCount = await Order.count();

    const cart = await Order.findOne({
      user_id: idUser,
      order_type: STATUS.CART,
    });

    const _product: ProductType = {
      product_id,
      name: product?.name,
      price: product?.price,
      color_id,
      size_id,
      quantity,
      image,
    };

    //chưa có cart -> add new
    if (!cart) {
      const cartItem = new Order({
        code: "#" + Number(orderCount + 1),
        user_id: idUser,
        total: quantity * Number(product?.price),
        products: [_product],
        order_type: STATUS.CART,
        payment_type: PaymentType.CASH,
        created_at: moment(new Date()).format("YYYY-MM-DD HH:mm"),
        created_by:
          user?.email + "_INS_" + moment(new Date()).format("YYYY-MM-DD HH:mm"),
      });
      const cart = await cartItem.save();

      res
        .status(200)
        .json({ message: "Add new cart successfully", result: cart });
    } else {
      //check cùng 1 sản phẩm và thuộc tính thì tăng số lượng
      const cartItemExists = await Order.findOneAndUpdate(
        {
          user_id: idUser,
          order_type: STATUS.CART,
          "products.product_id": product_id,
          "products.color_id": color_id,
          "products.size_id": size_id,
        },
        {
          $inc: {
            total: Number(product?.price) * quantity,
            "products.$.quantity": quantity,
          },
        },
        { new: true }
      );

      if (cartItemExists) {
        res
          .status(200)
          .json({ message: "Add cart successfully", result: cartItemExists });
      } else {
        console.log("4");
        const cartItemNew = await Order.findOneAndUpdate(
          {
            user_id: idUser,
            order_type: STATUS.CART,
            "products.product_id": product_id,
            "products.color_id": color_id,
            "products.size_id": size_id,
          },
          {
            $push: { products: [_product] },
            $inc: {
              total: Number(product?.price) * quantity,
            },
          },
          { new: true }
        );
        if (cartItemNew) {
          res
            .status(200)
            .json({ message: "Update cart successfully", result: cartItemNew });
        } else {
          res.status(500).json({ message: "Add cart failed" });
        }
      }
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { product_id, color_id, size_id } = req.body;
    const idUser = getIdFromReq(req);
    const _orderProducts = (
      await Order.findOne({
        user_id: idUser,
        order_type: STATUS.CART,
      })
    )?.products;

    const product = _orderProducts?.find((item) => console.log(item));

    const updateCart = await Order.findOneAndUpdate(
      {
        user_id: idUser,
        order_type: STATUS.CART,
      },
      {
        // $inc: {
        //   total: produc,
        // },
        $pull: {
          products: {
            product_id: product_id,
            color_id: color_id,
            size_id: size_id,
          },
        },
      }
    );
    if (updateCart) {
      res.status(200).json({ message: "Remove From Cart Successfully" });
    } else {
      res.status(500).json({ message: "Remove From Cart Failed" });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const idUser = getIdFromReq(req);
    const order = await Order.findOneAndUpdate(
      { user_id: idUser },
      {
        $set: {
          products: [],
          total: 0,
        },
      },
      { new: true }
    );
    if (order) {
      res.status(200).json({ success: "Clear Cart Successfully" });
    } else {
      res.status(500).json({ message: "Failed To Clear Cart" });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
