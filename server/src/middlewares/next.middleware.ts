import { NextFunction, Request, Response } from 'express';

import { CustomError } from '../helpers/custom.errors';

export const errorMiddleware = (error: CustomError, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof CustomError) {
    response.status(error.statusCode).json({ error: error.message });
  } else {
    response.status(500).json({ error: 'Internal Server Error' });
  }
};
