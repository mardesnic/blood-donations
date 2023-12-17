export interface Dictionary {
  login: {
    signIn: string;
    email: string;
    password: string;
    errors: {
      email: string;
      password: string;
      invalid: string;
    };
  };
}

interface Dictionaries {
  [key: string]: () => Promise<Dictionary>;
}

const dictionaries: Dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  hr: () => import('./dictionaries/hr.json').then((module) => module.default),
};

export const getDictionary = async (locale: string): Promise<Dictionary> =>
  dictionaries[locale]();
