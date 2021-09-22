type TypeKeywordMap = {
  string: string;
  number: number;
  any: any;
  boolean: boolean;
};

export type TypeOf<T> = T extends keyof TypeKeywordMap
  ? TypeKeywordMap[T]
  : never;

export type KeywordOf<T> =
  | keyof {
      [K in keyof TypeKeywordMap as T extends TypeKeywordMap[K]
        ? K
        : never]: TypeKeywordMap[K];
    }
  | "any";

export type FunctionTemplate<
  Params extends [...any] = [],
  ReturnType = void
> = {
  name: string;
  description: string;
  params: {
    [K in keyof Params]: {
      name: string;
      defaultValue?: Params[K];
      type: KeywordOf<Params[K]>;
    };
  };
  returnType: KeywordOf<ReturnType>;
  defaultReturnValue?: ReturnType;
};
