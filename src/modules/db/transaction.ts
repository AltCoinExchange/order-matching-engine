import * as Mongoose from "mongoose";

export function Transactional() {
  return function decorator(t, n, descriptor) {
    const original = descriptor.value;
    descriptor.value = async (...args) => {
      await Mongoose.connect("mongodb://127.0.0.1:27017/eth", {useMongoClient: true});
      return original.apply(this, args);
    };
    return descriptor;
  };
}
