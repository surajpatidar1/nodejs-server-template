import type { User } from "@/modules/user/user.type.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};