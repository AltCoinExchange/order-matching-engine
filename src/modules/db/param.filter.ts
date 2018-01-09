import * as Mongoose from "mongoose";

export function ParamFilter() {
  return function decorator(t, n, descriptor) {
    const original = descriptor.value;
    descriptor.value = async (...args) => {
      console.log(args);
      return original.apply(this, args);
    };
    return descriptor;
  };
}
