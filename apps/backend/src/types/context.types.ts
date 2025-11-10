import type { OwnershipService } from "../services/ownership.service.ts";

/**
 * Hono context variables for type-safe access to middleware-injected values
 */
export interface AppVariables {
  userId: string;
  ownershipService: OwnershipService;
}
