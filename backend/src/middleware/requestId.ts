import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const REQUEST_ID_HEADER = 'x-request-id';

export function requestId(req: Request, _res: Response, next: NextFunction) {
  req.traceId = randomUUID();
  next();
}
