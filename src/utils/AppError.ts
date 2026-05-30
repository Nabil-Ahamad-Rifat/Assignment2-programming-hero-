export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number,
    public errors?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
