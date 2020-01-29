import { useState, useEffect } from 'react';
import { State, Actions, Models, Model, Mutations } from './types';
import Utils from './utils';

const { notString, notObject, notFunction, isObject, modelNotExist } = Utils;
const models: Models = {};

type getActions<T> = (
  model: (modelName: string) => Pick<Model<T>, 'state' | 'actions' | 'mutations'>,
) => Actions;
type getMutations<S> = (s: State<S>) => Mutations<S>;

interface Store<S> {
  state: State<S>;
  actions: getActions<S>;
  mutations: getMutations<S>;
}

export function setModel<T>(name: string, store: Store<T>): void {
  let initialState: State<T>;
  let getActions: getActions<T>;
  let getMutations: getMutations<T>;

  if (process.env.NODE_ENV !== 'production') {
    if (typeof name !== 'string') {
      throw new Error(notString('name'));
    }
    if (name in models) {
      throw new Error('store name already exists');
    }

    if (!isObject(store)) {
      throw new Error(notObject('store'));
    }
    ({ state: initialState, actions: getActions, mutations: getMutations } = store);
    if (!isObject(initialState)) {
      throw new Error(notObject('state'));
    }
    if (typeof getActions !== 'function') {
      throw new Error(notFunction('actions'));
    }
    if (typeof getMutations !== 'function') {
      throw new Error(notFunction('mutations'));
    }
  } else {
    if (name in models) return;
    ({ state: initialState, actions: getActions, mutations: getMutations } = store);
  }

  const getModel = (modelName = name): Model<T> => {
    const result: any = {};
    Object.keys(models[modelName] as Model<T>).forEach((key) => {
      result[key] = new Proxy(models[modelName][key as keyof Model<any>], {
        set(target, propKey, value, receiver): boolean {
          console.warn(`in action, you can't change value key:${propKey as any}`);
          return Reflect.set(target, propKey, value, receiver);
        },
      });
    });
    return result;
  };
  const rawActions = getActions(getModel);
  const actions: any = {};
  const mutations: any = {};
  models[name] = { state: initialState, actions, setters: [], mutations };
  const rawMutations = getMutations(models[name].state);
  Object.entries(rawActions).forEach(([actionName, rawAction]) => {
    actions[actionName] = (...args: any[]) => {
      const res = rawAction(...args);
      if (res && typeof res.then === 'function') {
        return new Promise((resolve, reject) => {
          res.then(resolve, reject).catch(reject);
        });
      }
      return res;
    };
  });
  Object.entries(rawMutations).forEach(([mutationName, rawMutation]) => {
    mutations[mutationName] = (...args: any[]) => {
      rawMutation(...args);
      models[name].setters.forEach((setter) => {
        setter({});
      });
    };
  });
  models[name] = { state: initialState, actions, setters: [], mutations };
}

export const useModel = (name: string) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof name !== 'string') {
      throw new Error(notString('name'));
    }
    if (!(name in models)) {
      throw new Error(modelNotExist(name));
    }
  }

  const [, setState] = useState();
  const { state, actions, setters, mutations } = models[name];
  useEffect(() => {
    setters.push(setState);
    return () => {
      const index = setters.indexOf(setState);
      setters.splice(index, 1);
    };
  }, [setters]);
  return { ...state, ...actions, ...mutations };
};

export * from './types';
