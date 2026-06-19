// ============================================================
// HARDCODED USER LIST — edit this file to add/remove people.
// No signup, no password reset. You manage users here.
// ============================================================

export type Role = "admin" | "tester";

export interface User {
  id: string;        // login ID (used as user_id in stored answers)
  password: string;  // plain text is fine for a closed IRB study cohort
  role: Role;
  name?: string;     // optional display name
}

export const USERS: User[] = [
  // ----- ADMIN(S) -----
  { id: "admin", password: "changeme-admin", role: "admin", name: "Study Admin" },

  // ----- TEST TAKERS (clinicians) -----
  { id: "clinician1", password: "vertigo-001", role: "tester", name: "Clinician 1" },
  { id: "clinician2", password: "vertigo-002", role: "tester", name: "Clinician 2" },
  { id: "clinician3", password: "vertigo-003", role: "tester", name: "Clinician 3" },
  // add more clinicians here ...

  // ----- SOFTWARE-TEST ACCOUNT (behaves like a tester; shown in admin as
  //       "tester 1" with a Delete-data button so dummy runs can be cleared) -----
  { id: "tester1", password: "test-001", role: "tester", name: "tester 1" },
  { id: "tester2", password: "test-002", role: "tester", name: "tester 2" },
];

export function findUser(id: string, password: string): User | null {
  const u = USERS.find((x) => x.id === id && x.password === password);
  return u ?? null;
}

export function getUser(id: string): User | null {
  return USERS.find((x) => x.id === id) ?? null;
}