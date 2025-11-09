import "dotenv/config";

const required = ["DATABASE_URL", "JWT_SECRET"] as const;

for (const key of required) {
  if (!process.env[key])
    throw new Error(`Missing environment variable: ${key}`);
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  dbUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  saltRounds: Number(process.env.SALT_ROUNDS ?? 10),
} as const;
