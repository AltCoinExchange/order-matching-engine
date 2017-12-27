export class ParamsHelper {
  public static filterParams(params: any) {
    if (params !== undefined) {
      for (const param in params) {
        params[param] = params[param].slice(1);
      }
    }
  }
}