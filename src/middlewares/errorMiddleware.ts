import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    status?: number;
}

const errorMiddleware = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
      });
}

export default errorMiddleware;
