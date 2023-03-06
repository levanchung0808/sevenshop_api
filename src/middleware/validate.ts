import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { parseJwt } from "utils/token";
import User from "models/user";

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.slice(7); // cut Bearer
  const user = await verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: "Access denied" });
  }
  next();
};

export const validateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.slice(7); // cut Bearer
  const user = await verifyToken(token);
  if (!user || user.role !== "admin") {
    return res.status(401).json({ message: "Access denied" });
  }
  next();
};

async function verifyToken(token: string | undefined) {
  if (!token) {
    return null;
  }
  try {
    const { _id } = parseJwt(token);
    const user = await User.findById(_id);
    if (!user || user.access_token !== token) {
      return null;
    }
    jwt.verify(token, process.env.JWT_SECRET || "");
    return user;
  } catch (err) {
    return null;
  }
}

