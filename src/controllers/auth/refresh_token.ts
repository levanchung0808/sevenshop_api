import { Request, Response } from "express";
import User from "models/user";
import { parseJwt, tokenGen } from "utils/token";

const refreshToken = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(500).json({ message: "Missing token" });
  }
  const parToken = parseJwt(refresh_token);
  const { _id, exp } = parToken;
  // check expired token
  if (exp < new Date().getTime() / 1000) {
    return res.status(500).json({ message: "Refresh token expired" });
  }
  const user = await User.findOne({ _id, refresh_token });
  if (!user) {
    return res.status(500).json({ message: "Refresh token fail" });
  }
  const access_token = tokenGen(
    { _id: user.id, role: user.role },
    parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
  );
  user.access_token = access_token;
  await user.save();
   return res.status(200).json({
    message: "Refresh token success",
    access_token,
  });
};

export default refreshToken;
