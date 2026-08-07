import type { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "@/utils/index.js";
import { jwtService, TokenType } from "@/services/index.js";

const getAccessToken = (req: Request): string | undefined => {
  const authorization = req.headers.authorization;

  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();

    if (token) {
      return token;
    }
  }

  const cookieToken = req.cookies?.[TokenType.ACCESS_TOKEN]

  if (cookieToken?.trim()) {
    return cookieToken;
  }

  return undefined;
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

  try {
    const payload = jwtService.verify(
      token,
      TokenType.ACCESS_TOKEN,
    );

    req.user = payload;

    next();
  } catch {
    throw UnauthorizedException("Invalid or expired token");
  }
};