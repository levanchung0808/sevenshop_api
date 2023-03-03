import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { parseJwt } from "utils/token";
import User from "models/user";
import Log from "libraries/log";

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.slice(7); // cut Bearer
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }
  const { _id } = parseJwt(token);
  const user = await User.findById(_id);
  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }
  if (user.access_token !== token) {
    return res.status(400).json({ message: "Invalid token" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET || "");
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

export const validateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.slice(7); // cut Bearer
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }
  const { role, _id } = parseJwt(token);
  Log.info(role);
  const user = await User.findById(_id);
  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }
  if (user.access_token !== token) {
    return res.status(400).json({ message: "Invalid token" });
  }
  if (role !== "admin") {
    return res.status(401).json({ message: "Access denied" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET || "");
    next();
  }
  catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};
