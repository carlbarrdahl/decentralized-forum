import { format, isValid } from "date-fns";

export const formatTime = (date) => {
  const d = new Date(date);
  return isValid(d) ? format(d, "MMM dd") : "";
};
