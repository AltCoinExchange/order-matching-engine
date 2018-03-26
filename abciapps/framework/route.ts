export const routes = {};

export function Route(path: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor): any => {
    if (routes[path]) {
      throw new Error('Duplicate route action!');
    }
    routes[path] = descriptor.value;
  };
}
