export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public errors?: any[];

  constructor(message: string, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
