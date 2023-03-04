export type IModify = {
  action: string;
  date: string;
};

export type IOTP = {
  code: number | undefined;
  exp: string;
};

export const Modify = {
  action: String,
  date: String,
};

export const OTP = {
  code: Number,
  exp: String,
};