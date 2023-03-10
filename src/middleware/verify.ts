import moment from "moment";
import User, { OTPType, STATUS } from "models/user";
import { Types } from "mongoose";
import { Response } from "express";
import nodemailer from "nodemailer";

type AccountVerifyType = {
  email?: string;
  phone?: string;
  res: Response;
};

const sendMail = (
  user_id: Types.ObjectId,
  otp: string,
  email: string,
  res: Response,
  type: string
) => {
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
  var content = `
  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #AC1506;text-decoration:none;font-weight:600">Seven Shop</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Seven Shop. Use the following OTP to complete your ${type} procedures. OTP is valid for ${process.env.EXPIRED_OTP} minutes</p>
    <h2 style="background: #AC1506;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Seven Shop</p>
    <hr style="border:none;border-top:1px solid #eee" />

  </div>
</div>
  `;
  const mailOptions = {
    from: process.env.USER_APP_MAIL,
    to: email,
    subject: "Verify your email",
    html: content,
  };
  transporter.sendMail(mailOptions, async (err) => {
    if (err) {
      console.log(err);
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
  const expired = new Date();
  expired.setMinutes(expired.getMinutes() + Number(process.env.EXPIRED_OTP));
  return { code: otp.toString(), expired };
};

export const accountVerify = async (props: AccountVerifyType) => {
  const { email, phone, res } = props;
  const user = await User.findOne(email ? { email } : { phone });
  if (user) {
    if (user.status === STATUS.active) {
      return res.status(500).json({ message: "Account already exists" });
    }
    if (user.status === STATUS.pending) {
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
  }
  // create new user
  const otp = (await generateOTP()) as OTPType;
  const newUser = new User({
    email,
    phone,
    otp,
  });
  newUser.create_at = moment(new Date()).format("YYYY-MM-DD HH:mm");
  newUser.create_by = "REGISTER|";
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
    if (user.status === STATUS.active) {
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
    if (moment(user.otp.expired).isBefore(new Date())) {
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
