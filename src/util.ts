export const getNowSchoolYear = (date = new Date()) => {
  const month = date.getMonth() + 1;
  date.setMonth(month - 4);
  return date.getFullYear();
};

export const sleep = (second: number): void => {
  Utilities.sleep(second * 1000);
};

export const getFormattedDate = function(date = new Date()): string {
  let obj: object = {
    MM: String(date.getMonth() + 1),
    dd: String(date.getDate()),
    hh: String(date.getHours()),
    mm: String(date.getMinutes()),
    ss: String(date.getSeconds())
  };

  // 月、日、時、分が一桁の場合は先頭に0をつける
  const keys: string[] = Object.keys(obj);
  for (let key of keys) {
    if (parseInt(obj[key]) < 10) {
      obj[key] = '0' + obj[key];
    }
  }
  const EEEIndex = date.getDay();
  const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const EEE = week[EEEIndex];

  const yyyy = date.getFullYear();

  return `${yyyy}/${obj['MM']}/${obj['dd']}[${EEE}] ${obj['hh']}:${obj['mm']}:${obj['ss']}`;
};
