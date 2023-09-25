import { keccak256, hexlify } from "ethers/lib/utils";
// Role names
export type RoleName = "DEFAULT_ADMIN_ROLE" | "ADMIN_ROLE" | "MINTER_ROLE";
export type Role = RoleName | "admin" | "minter";
// Role hashes (blockchain)
const ORACLE_ROLE = keccak256(Buffer.from("MINTER_ROLE"));
const DEFAULT_ADMIN_ROLE = hexlify(new Uint8Array(32));
// Given a role name returns a role hash
export const RoleHash = new Map<Role | undefined, string>([
  ["DEFAULT_ADMIN_ROLE", DEFAULT_ADMIN_ROLE],
  ["ADMIN_ROLE", DEFAULT_ADMIN_ROLE],
  ["MINTER_ROLE", ORACLE_ROLE],
  ["admin", DEFAULT_ADMIN_ROLE],
  ["minter", ORACLE_ROLE],
  [undefined, DEFAULT_ADMIN_ROLE],
]);