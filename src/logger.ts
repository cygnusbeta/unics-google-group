export const logVar = (obj: object): string => {
  const varName: string = Object.keys(obj)[0];
  const log = `${varName}: ${obj[varName]}`;
  console.log(log);
  return log;
};

export const logVarL = (obj: object): string => {
  const varName: string = Object.keys(obj)[0];
  const log = `${varName}: ${obj[varName]}`;
  console.log(log);
  return `${log}\n`; // log をつなげた後、最後に .trim(); するのを忘れずに
};

export const logVars = (obj: object): string => {
  const varNames: string[] = Object.keys(obj);
  let logs = '';
  varNames.forEach(varName => {
    let log = `${varName}: ${obj[varName]}`;
    logs += `${log}\n`;
  });
  logs = logs.trim();
  console.log(logs);
  return logs;
};
