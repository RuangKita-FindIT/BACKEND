import { sign, verify } from "jsonwebtoken";

export function generateToken(userId: string): string {
  return sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  try {
    return verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
}
