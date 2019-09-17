export const getNowSchoolYear = (date = new Date()) => {
  const month = date.getMonth() + 1;
  date.setMonth(month - 4);
  return date.getFullYear();
};

export const sleep = (second: number): void => {
  Utilities.sleep(second * 1000);
};
