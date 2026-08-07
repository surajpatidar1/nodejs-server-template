import type { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "@/utils/index.js";
import { jwtService, TokenType } from "@/services/index.js";

const getAccessToken = (req: Request): string | undefined => {
  const authorization = req.headers.authorization;

  if (authorization?.startsWith("Bearer ")) {
    return authorization.split(" ")[1];
  }

  return req.cookies?.accessToken;
};

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = getAccessToken(req);

  if (!token) {
    throw UnauthorizedException("Access token required");
  }

  const payload = jwtService.verify(
    token,
    TokenType.ACCESS_TOKEN,
  );

  req.user = payload;

  next();
};