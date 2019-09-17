export const logVar = (obj: object) => {
  const varName: string = Object.keys(obj)[0];
  const log: string = `${varName}: ${obj[varName]}`;
  console.log(log);
  return log;
};
