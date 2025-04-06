import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateState } from "oslo/oauth2";
import { googleOAuth2Client, getGoogleUser } from "../config/auth.config";
import { responseUtils } from "../utils/response";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();
const authRoutes = new Hono();

authRoutes.get("/google", async (c) => {
  const googleOAuth2State = generateState();

  const url = await googleOAuth2Client.createAuthorizationURL({
    state: googleOAuth2State,
    scopes: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });

  setCookie(c, "google_oauth2_state", googleOAuth2State, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return c.redirect(url.toString() + "&prompt=select_account");
});

authRoutes.get("/google/callback", async (c) => {
  try {
    const { state, code } = c.req.query();
    const googleOAuth2State = getCookie(c, "google_oauth2_state");

    if (!googleOAuth2State || !state || googleOAuth2State !== state) {
      return responseUtils(c, "Invalid state parameter", 400);
    }

    const { access_token } = await googleOAuth2Client.validateAuthorizationCode(
      code as string,
      {
        credentials: process.env.GOOGLE_CLIENT_SECRET!,
        authenticateWith: "request_body",
      }
    );

    const googleUser = await getGoogleUser(access_token);

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return responseUtils(c, "Authenticated successfully", 200, { user, token });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return responseUtils(c, "Authentication failed", 500);
  }
});

export { authRoutes };
