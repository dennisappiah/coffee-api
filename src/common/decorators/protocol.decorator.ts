import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Protocol = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.protocol; //http
  },
);
