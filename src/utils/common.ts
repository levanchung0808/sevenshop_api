import moment from "moment";

export const formatDateTime = (date: Date | string) => {
  return moment(date).format("LLL");
};

export const getDateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss");
};

export const getDateNowPlusMinute = (minute: number) => {
  return moment().add(minute, "minutes").format("YYYY-MM-DD HH:mm:ss");
};

export const convertDate = (date: Date | string) => {
  return moment(date).format("YYYY-MM-DD");
};

export const isValidDate = (dateString: string) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
}