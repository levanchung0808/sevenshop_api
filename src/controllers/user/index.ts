import { Request, Response } from "express";
import User, { IUser } from "models/user";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res
      .status(200)
      .json({ message: "Get Users Successfully", result: users });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export const getUserByID = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const user = await User.findOne({ _id });
    if (user) {
      return res
        .status(200)
        .json({ message: "Get Users Successfully", result: user });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const idUser = req.params.id;
    const user = await User.findOneAndDelete({ _id: idUser });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Delete successfully" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
