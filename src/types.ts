export interface ClassName {
  className?: string;
}

export type Tuple<T> = { [key: string]: T };

export type FormElements<T> = { name: string; value: T }[];
