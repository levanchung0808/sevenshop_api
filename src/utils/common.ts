import Log from "libraries/log";
import moment from "moment";

export const formatDateTime = (date: Date | string) => {
  return moment(date).format("LLL");
};

export const getNow = () => {
  return moment() + "";
};

export const getNowPlusMinute = (minute: number) => {
  return moment().add(minute, "minutes") + "";
};

export const isValidDate = (dateString: string) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
};

export const fieldValidation = {
  string: (val: any) => typeof val === "string",
  number: (val: any) => typeof val === "number",
  boolean: (val: any) => typeof val === "boolean",
  array: (val: any) => Array.isArray(val),
  arrayString: (val: any) => Array.isArray(val) && val.every((v) => typeof v === "string"),
  arrayObject: (val: any) => Array.isArray(val) && val.every((v) => typeof v === "object"),
};

export function validateFields(
  body: any,
  fields: {
    name: string;
    type: keyof typeof fieldValidation;
    required?: boolean;
  }[]
): string | undefined {
  const errors: string[] = [];
  fields.forEach((field) => {
    if (field.required && !body[field.name]) {
      errors.push(`${field.name} is required`);
    }
    if (body[field.name] !== undefined) {
      const validator = fieldValidation[field.type];
      if (!validator(body[field.name])) {
        errors.push(`${field.name} must be a ${field.type}`);
      }
    }
  });
  return errors.length > 0 ? errors.join(", ") : undefined;
}
