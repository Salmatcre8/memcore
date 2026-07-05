import bcrypt from "bcryptjs";

/**
 * DEMO USER STORE
 * ----------------
 * Stands in for a real users table. Passwords are hashed with bcrypt even
 * here so the auth flow (`lib/auth.ts`) exercises the same comparison logic
 * a production Postgres-backed user store would use — swap this file for a
 * real database query (e.g. Prisma / Drizzle against `DATABASE_URL`) when
 * you're ready, without touching `lib/auth.ts`.
 *
 * Demo credentials (shown on the login page too):
 *   ada@memcore.dev   / memcore-demo
 *   femi@memcore.dev  / memcore-demo
 */

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  initials: string;
}

const DEMO_PASSWORD_HASH = bcrypt.hashSync("memcore-demo", 10);

export const DEMO_USERS: DemoUser[] = [
  {
    id: "user-ada",
    name: "Ada",
    email: "ada@memcore.dev",
    passwordHash: DEMO_PASSWORD_HASH,
    initials: "AD",
  },
  {
    id: "user-femi",
    name: "Femi",
    email: "femi@memcore.dev",
    passwordHash: DEMO_PASSWORD_HASH,
    initials: "FE",
  },
];

export function findUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function verifyPassword(user: DemoUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
