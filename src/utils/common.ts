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

export function validateFields(
  body: any,
  fields: { name: string; type: string; required?: boolean }[]
): string[] | undefined {
  const errors: string[] = [];
  fields.forEach((field) => {
    if (field.required && !body[field.name]) {
      errors.push(`${field.name} is required`);
    }
    if (body[field.name]) {
      switch (field.type) {
        case "string":
          if (typeof body[field.name] !== "string") {
            errors.push(`${field.name} must be a string`);
          }
          break;
        case "number":
          if (typeof body[field.name] !== "number") {
            errors.push(`${field.name} must be a number`);
          }
          break;
        case "boolean":
          if (typeof body[field.name] !== "boolean") {
            errors.push(`${field.name} must be a boolean`);
          }
          break;
        default:
          break;
      }
    }
  });
  if (errors.length > 0) {
    return errors;
  }
  return undefined;
}
