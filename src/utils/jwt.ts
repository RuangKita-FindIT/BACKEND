import { sign, verify } from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: JwtPayload): string {
  return sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d", // Token expires in 7 days
  });
}

export function verifyToken(token: string) {
  try {
    return verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    return null;
  }
}
