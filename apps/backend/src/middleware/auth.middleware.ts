import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../models/user.types.ts";
import type { AppVariables } from "../models/context.types.ts";

const JWT_SECRET = process.env.JWT_SECRET!;

// Authentication Middleware
export const authMiddleware = async (
  c: Context<{ Variables: AppVariables }>,
  next: Next,
) => {
  try {
    const authHeader = c.req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid Authorization header" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // Attach decoded user info so downstream routes can access user info
    c.set("userId", decoded.userId);

    await next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
