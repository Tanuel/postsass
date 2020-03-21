class ErrorCollector {
  private static instance = new ErrorCollector([]);

  public static getInstance() {
    return ErrorCollector.instance;
  }
  constructor(private errors: Error[]) {}
  public push(...errors: Error[]) {
    this.errors.push(...errors);
  }
  public hasErrors(): boolean {
    return this.errors.length > 0;
  }
  public forEach(...params: Parameters<Array<Error>["forEach"]>): void {
    return this.errors.forEach(...params);
  }
}

export function addError(...errors: Error[]) {
  ErrorCollector.getInstance().push(...errors);
}

export function getErrorCollector() {
  return ErrorCollector.getInstance();
}
