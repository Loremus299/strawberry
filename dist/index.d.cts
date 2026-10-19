//#region src/index.d.ts
export declare class Logger {
  private readonly ctx;
  private lastTime;
  constructor();
  private push;
  error(key: string, value: Object): void;
  warn(key: string, value: Object): void;
  info(key: string, value: Object): void;
  debug(key: string, value: Object): void;
  trace(key: string, value: Object): void;
  private sub;
  nest(title: string): Logger;
  get id(): string;
}
//#endregion