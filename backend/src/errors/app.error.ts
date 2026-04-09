export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
