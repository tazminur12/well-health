import { Role } from "@prisma/client";

import { getSessionUser } from "@/lib/auth/session";

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

/** Server-side admin gate — never trust client role checks alone. */
export async function requireAdmin() {
  const user = await getSessionUser();

  if (!user) {
    throw new AdminAuthError("Please sign in to continue.");
  }

  if (user.role !== Role.ADMIN) {
    throw new AdminAuthError("Admin access required.");
  }

  return user;
}
