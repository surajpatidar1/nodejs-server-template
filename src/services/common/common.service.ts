import crypto from "node:crypto";
import { promisify } from "node:util";
import { configPassword } from "@/configs/config.password.js";

const scryptAsync = promisify(crypto.scrypt);

export const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(configPassword.SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(
    password,
    salt,
    configPassword.KEY_LENGTH
  )) as Buffer;

  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
};

export const verifyPassword = async (
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> => {
  const derivedKey = (await scryptAsync(
    password,
    salt,
    configPassword.KEY_LENGTH
  )) as Buffer;

  const storedHashBuffer = Buffer.from(storedHash, "hex");

  return crypto.timingSafeEqual(
    derivedKey,
    storedHashBuffer
  );
};