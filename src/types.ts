export interface State<T extends {}> {
  [stateName: string]: T;
}

export type Action = (...args: any[]) => any;
export interface Actions {
  [actionName: string]: Action;
}

export type Mutation<T> = (...args: any[]) => State<T>;
export interface Mutations<T> {
  [mutationName: string]: Mutation<T>;
}

export type Setter<S> = (prevState: S) => S;

export type Model<T> = {
  state: State<T>;
  actions: { [propName: string]: () => void };
  setters: Setter<T>[];
  mutations: { [propName: string]: () => void };
};
export interface Models {
  [modelName: string]: Model<any>;
}
