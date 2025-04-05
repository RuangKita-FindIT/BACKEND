import { Context, Next } from "hono";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    c.set("user", user);

    await next();
  } catch (error) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
}
