export type Reducer<T, U = T> = (prev: T, next: U) => T;

export const replace = (_: any, next: any) => next;

export const merge = (prev: any, next: any) => ({ ...prev, ...next });
