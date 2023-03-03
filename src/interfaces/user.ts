export type IMembership = {
  name: string;
  description: string;
  point: number;
};

export type IAddress = {
  _id?: string;
  address: string;
  full_name: string;
  phone: string;
  default_address: boolean;
};

export const Membership = {
  name: String,
  description: String,
  point: Number,
};

export const Address = {
  address: String,
  full_name: String,
  phone: String,
  default_address: Boolean,
};
