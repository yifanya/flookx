import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { setModel } from './index';

configure({ adapter: new Adapter() });

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (args[0].includes('Warning: An update to %s inside a test was not wrapped in act')) return;
    console.error(...args);
  });
});

test('setModel', () => {
  // 当直接调用时候抛异常
  expect(() => {
    setModel();
  }).toThrow();

  const model = {
    state: {},
    mutations: {},
    actions: () => ({}),
  };
  setModel('exist', model);
  setModel('exist', model);
  process.env.NODE_ENV = 'production';
  setModel('exist', model);
  process.env.NODE_ENV = 'test';

  expect(() => {
    setModel('noModel');
  }).toThrow();

  expect(() => {
    setModel('noModelKeys', {});
  }).toThrow();

  expect(() => {
    setModel('noModelActions', { state: {} });
  }).toThrow();
});
