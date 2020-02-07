import * as React from 'react';

export interface State {
  [propName: string]: any;
}

export type Action = (...args: any[]) => any;
export interface Actions {
  [actionName: string]: Action;
}

export type Mutation = (...args: any[]) => void;
export interface Mutations {
  [mutationName: string]: Mutation;
}

export type Setter = (setState: React.Dispatch<any>) => void;
export interface Model {
  state: State;
  mutations: Mutations;
  actions: Actions;
  setters: Setter[];
}

export interface Store {
  state: State;
  mutations: (state: State) => Mutations;
  actions: (model: (name?: string) => any) => Actions;
}
