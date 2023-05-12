export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequest extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class Unauthorized extends CustomError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class PaymentRequired extends CustomError {
  constructor(message: string) {
    super(message, 402);
  }
}

export class Forbidden extends CustomError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFound extends CustomError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class MethodNotAllowed extends CustomError {
  constructor(message: string) {
    super(message, 405);
  }
}

export class NotAcceptable extends CustomError {
  constructor(message: string) {
    super(message, 406);
  }
}

export class Conflict extends CustomError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class Locked extends CustomError {
  constructor(message: string) {
    super(message, 423);
  }
}

export class NotImplemented extends CustomError {
  constructor(message: string) {
    super(message, 501);
  }
}
