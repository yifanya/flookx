/**
 * Utils
 */
const notBoolean = (key: string): string => `"${key}" must be a boolean`;
const notString = (key: string): string => `"${key}" must be a string`;
const notObject = (key: string): string => `"${key}" must be an object`;
const notFunction = (key: string): string => `"${key}" must be a function`;
const modelNotExist = (name: string): string => `"${name}" model dose not exist`;
const isObject = (data: any): boolean => Object.prototype.toString.call(data) === '[object Object]';

export default {
  notBoolean,
  notString,
  notObject,
  notFunction,
  isObject,
  modelNotExist,
};
