import { Hono } from "hono";
import { dbPool } from "../db.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { nanoid } from "nanoid";
import type { User, AuthPayload, AuthResponse } from "../types/user.types.ts";

export const authRoutes = new Hono();

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const JWT_SECRET = process.env.JWT_SECRET!;

// Registration Route
authRoutes.post("/register", async (c) => {
  const payload = await c.req.json().catch(() => null);
  if (!payload) return c.json({ message: "Invalid JSON payload" }, 400);

  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const { rowCount } = await dbPool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (rowCount) return c.json({ error: "User already exists" }, 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = nanoid();

    await dbPool.query(
      "INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)",
      [userId, name, email, hashedPassword],
    );

    return c.json({ message: "User registered successfully" }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

//Loin route
authRoutes.post("/login", async (c) => {
  const payload = await c.req.json().catch(() => null);
  if (!payload) return c.json({ message: "Invalid JSON payload" }, 400);

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
    );
  }

  const { email, password } = parsed.data;

  try {
    const result = await dbPool.query<User>(
      "SELECT id, password FROM users WHERE email = $1",
      [email],
    );
    const user = result.rows[0];
    if (!user) return c.json({ error: "Invalid credentials" }, 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return c.json({ error: "Invalid credentials" }, 401);

    const payload: AuthPayload = { userId: user.id };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    const response: AuthResponse = { accessToken, expiresIn: "1h" };
    return c.json(response, 200);
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
