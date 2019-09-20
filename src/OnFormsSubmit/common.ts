import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;
import { onRegistrationFormSubmit } from './registration';

declare var global: any;

export const format = (str: string): string => {
  return str.replace(/^確認して((.(?!ます))*)します$/, '$1');
};

global.onFormSubmit = (e: FormsOnSubmit): void => {
  let form: string = e.namedValues['確認'][0];
  form = format(form);
  switch (form) {
    case '登録':
      onRegistrationFormSubmit(e);
      break;
  }
};
