# flookx

A state manager for React Hooks. **idea from flooks.** ^\_^

🍰 Simple | 🍕 Modules | 🥂 Flexible

---

## Install

```sh
yarn add flookx
```

or

```sh
npm install flookx
```

## Usage

```jsx harmony
import { useModel, setModel } from './flookx';

setModel('counter', {
  state: {
    number: 0
  },
  actions: (model) => ({
    asyncAddState () {
      const all = model();
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(5)
        }, 1000)
      })
    },
    asyncAdd () {
      const all = model();
      all.actions.asyncAddState().then(data => {
        all.mutations.add(data);
      })
    }
  }),
  mutations: (state) => ({
    add (data = 1) {
      state.number += data;
    },
    minute () {
      state.number--;
    }
  })
})

setModel('other', {
  state: {
    test: 'test'
  },
  mutations: (state) => ({
    changeTest (newTest) {
      console.log('state', state);
      state.test = newTest;
    }
  }),
  actions: (model) => ({
    asyncChange (newTest) {
      const other = model();
      const counter = model('counter');
      counter.actions.asyncAdd();
      other.mutations.changeTest(newTest);
    }
  })
})

const Counter = () => {
  const { number, add, minute, asyncAdd } = useModel('counter');
  const { test, asyncChange } = useModel('other');

  return (
    <div>
      { number }
      <br/>
      { test }
      <button onClick={() => add()}>+</button>
      <button onClick={() => minute()}>-</button>
      <button onClick={() => asyncAdd()}>async +</button>
      <br/>
      <button onClick={() => asyncChange('new change test')}>change test</button>
    </div>
  )
}
```

## API

### 1. setModel()

```js
setModel(name, model);
```

Accepts a name string and an model object, initialize the model.

The model object needs to contain a `state` object, an `actions` function, a `mutations` function.

### 2. useModel()

```js
const { someState, someAction, someMutations } = useModel(name);
```

A React Hook. Accepts a name, returns the initialized model with its state, actions, mutations.

### 3. (state) => realMutations
you change state in mutations.
```js
mutations: (state) => ({ someMutations() {} })
```

The arguments of `mutations` contains a object, `state` is current store's state

### 4. (model) => realActions
It is where you perform a series of operations.
```js
actions: (model) => ({ someAction() {} });
```

The argument of `actions` contains a functions, `model()` can be used in every action. 

#### 4.1. model()

```js
const { state: {}, mutations: {}, actions: {} } = model(name?);
```

if you want get own model, `name` can be omitted.

i.e. `model()` for own model, `model('other')` for other models.