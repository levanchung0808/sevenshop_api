import User from "models/user";
import { Types } from "mongoose";
import { Response } from "express";
import nodemailer from "nodemailer";
import { STATUS_USER } from "constants/user";
import { IOTP } from "interfaces/basic";
import Log from "libraries/log";
import { getNow, getNowPlusMinute } from "utils/common";
import { createCart } from "controllers/cart";

type AccountVerifyType = {
  email?: string;
  phone?: string;
  res: Response;
};

const sendMail = (
  user_id: Types.ObjectId,
  otp: number | undefined,
  email: string,
  res: Response,
  type: string
) => {
  if (!otp) {
    return res.status(400).json({
      message: "OTP is not valid",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_APP_MAIL,
      pass: process.env.PASS_APP_MAIL,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const content = `<div style="font-family: 'Railway', sans-serif; width: 90%; max-width: 1000px; margin: 50px auto; overflow: auto; line-height: 2;">
  <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
    <a href="" style="font-size: 1.4em; color: #AC1506; text-decoration: none; font-weight: 600;">Seven Shop</a>
  </div>
  <p style="font-size: 1.1em;">Hi,</p>
  <p style="font-size: 1em;">Thank you for choosing Seven Shop. Use the following OTP to complete your ${type} procedures. OTP is valid for ${process.env.EXPIRED_OTP} minutes</p>
  <h2 style="background: #AC1506; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px; font-size: 1.5em;">${otp}</h2>
  <p style="font-size: 0.9em;">Regards,<br />Seven Shop</p>
  <hr style="border: none; border-top: 1px solid #eee;" />
</div>`;

  const mailOptions = {
    from: process.env.USER_APP_MAIL,
    to: email,
    subject: "Verify your email",
    html: content,
  };

  transporter.sendMail(mailOptions, async (err) => {
    if (err) {
      Log.error(err);
      return res.status(500).json({ message: "Send email fail" });
    }

    return res.status(200).json({
      message: "Send email success",
      result: {
        user_id,
      },
    });
  });
};

const generateOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const exp = getNowPlusMinute(Number(process.env.EXPIRED_OTP));
  return {
    code: otp,
    exp,
  };
};

export const accountVerify = async (props: AccountVerifyType) => {
  const { email, phone, res } = props;
  const user = await User.findOne(email ? { email } : { phone });
  if (user) {
    if (user.status === STATUS_USER.active) {
      return res.status(500).json({ message: "Account already exists" });
    }
    if (user.status === STATUS_USER.pending) {
      if (email) {
        const otp = await checkDateOTP(user._id);
        if (!otp) {
          return res.status(500).json({ message: "Send OTP fail" });
        }
        sendMail(user._id, otp.code, user.email, res, "Register");
        return;
      }
      return res.status(200).json({
        message: "Send OTP success",
        result: {
          otp: user.otp.code,
        },
      });
    }
    if (user.status === STATUS_USER.inactive) {
      return res.status(500).json({ message: "Account is inactive" });
    }
  }
  // create new user
  const otp = (await generateOTP()) as IOTP;
  const newUser = new User({
    email,
    phone,
    otp,
  });
  newUser.created_at = getNow();
  newUser.created_by = "user";
  const cart_id = await createCart(newUser._id)
  newUser.cart_id = cart_id;
  await newUser.save();
  if (email) {
    sendMail(newUser._id, otp.code, newUser.email, res, "Register");
    return;
  }
  return res.status(200).json({
    message: "Send OTP success",
    result: {
      otp: otp.code,
    },
  });
};

export const accountVerifyPassword = async (props: AccountVerifyType) => {
  const { email, phone, res } = props;
  const user = await User.findOne(email ? { email } : { phone });
  if (user) {
    if (user.status === STATUS_USER.active) {
      if (email) {
        const otp = await checkDateOTP(user._id);
        if (!otp) {
          return res.status(500).json({ message: "Send OTP fail" });
        }
        sendMail(user._id, otp.code, user.email, res, "Forgot Password");
        return;
      }
      return res.status(200).json({
        message: "Send OTP success",
        result: {
          otp: user.otp.code,
        },
      });
    }
  } else {
    return res.status(404).json({ message: "User not found" });
  }
};

export const checkDateOTP = async (id: Types.ObjectId) => {
  const user = await User.findById(id);
  // update if otp expired
  if (user) {
    if (user.otp.exp < getNow()) {
      const otp = await generateOTP();
      await user.updateOne({
        otp,
      });
      return otp;
    } else {
      return user.otp;
    }
  }
  return null;
};
