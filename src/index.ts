import { useState, useEffect } from 'react';
import { Store, Actions, Model, Mutations, State } from './types';
import Utils from './utils';

/**
 * @types
 */
interface Models {
  [modelName: string]: Model;
}
interface GetActions {
  (model: (name?: string) => any): Actions;
}
interface GetMutations {
  (state: State): Mutations;
}

const { notString, notObject, notFunction, isObject, modelNotExist } = Utils;
const models: Models = {};

export function setModel(name: string, store: Store): void {
  let initialState: State;
  let getActions: GetActions;
  let getMutations: GetMutations;

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

  const getModel = (modelName = name): Model => {
    const result: any = {};
    Object.keys(models[modelName] as Model).forEach((key) => {
      result[key] = new Proxy(models[modelName][key as keyof Model], {
        set(target, propKey, value, receiver): boolean {
          console.warn(`in action, you can't change value key:${propKey as any}`);
          console.log(propKey);
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
      models[name].setters.forEach((setter: any) => {
        setter({});
      });
    };
  });
}

export const useModel = <T extends {}, U extends {}, V extends {}>(name: string) => {
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
  return { ...state, ...actions, ...mutations } as T & U & V;
};

export * from './types';
