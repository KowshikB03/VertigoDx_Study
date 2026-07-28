// ============================================================
// HARDCODED USER LIST — edit this file to add/remove people.
// No signup, no password reset. You manage users here.
//
// For clinicians/testers, firstName/lastName/email are OPTIONAL. Fill them in
// as you assign accounts to real people; leave blank otherwise. They show in
// the admin "Credentials" tab. Admin has no name/email fields.
// ============================================================

export type Role = "admin" | "tester";

export interface User {
  id: string;         // login ID (used as user_id in stored answers)
  password: string;   // plain text is fine for a closed IRB study cohort
  role: Role;
  name?: string;      // optional display name
  firstName?: string; // optional — assigned clinician's first name
  lastName?: string;  // optional — assigned clinician's last name
  email?: string;     // optional — assigned clinician's contact email
}

export const USERS: User[] = [
  // ----- ADMIN(S) -----
  { id: "admin", password: "changeme-admin", role: "admin", name: "Study Admin" },

  // ----- CLINICIANS (50) — share these credentials when you assign a clinician,
  //       then note their first/last name + email here for your records. -----
  { id: "clinician1", password: "vertigo-001", role: "tester", name: "Clinician 1", firstName: "", lastName: "", email: "" },
  { id: "clinician2", password: "vertigo-002", role: "tester", name: "Clinician 2", firstName: "", lastName: "", email: "" },
  { id: "clinician3", password: "vertigo-003", role: "tester", name: "Clinician 3", firstName: "", lastName: "", email: "" },
  { id: "clinician4", password: "vertigo-004", role: "tester", name: "Clinician 4", firstName: "", lastName: "", email: "" },
  { id: "clinician5", password: "vertigo-005", role: "tester", name: "Clinician 5", firstName: "", lastName: "", email: "" },
  { id: "clinician6", password: "vertigo-006", role: "tester", name: "Clinician 6", firstName: "", lastName: "", email: "" },
  { id: "clinician7", password: "vertigo-007", role: "tester", name: "Clinician 7", firstName: "", lastName: "", email: "" },
  { id: "clinician8", password: "vertigo-008", role: "tester", name: "Clinician 8", firstName: "", lastName: "", email: "" },
  { id: "clinician9", password: "vertigo-009", role: "tester", name: "Clinician 9", firstName: "", lastName: "", email: "" },
  { id: "clinician10", password: "vertigo-010", role: "tester", name: "Clinician 10", firstName: "", lastName: "", email: "" },
  { id: "clinician11", password: "vertigo-011", role: "tester", name: "Clinician 11", firstName: "", lastName: "", email: "" },
  { id: "clinician12", password: "vertigo-012", role: "tester", name: "Clinician 12", firstName: "", lastName: "", email: "" },
  { id: "clinician13", password: "vertigo-013", role: "tester", name: "Clinician 13", firstName: "", lastName: "", email: "" },
  { id: "clinician14", password: "vertigo-014", role: "tester", name: "Clinician 14", firstName: "", lastName: "", email: "" },
  { id: "clinician15", password: "vertigo-015", role: "tester", name: "Clinician 15", firstName: "", lastName: "", email: "" },
  { id: "clinician16", password: "vertigo-016", role: "tester", name: "Clinician 16", firstName: "", lastName: "", email: "" },
  { id: "clinician17", password: "vertigo-017", role: "tester", name: "Clinician 17", firstName: "", lastName: "", email: "" },
  { id: "clinician18", password: "vertigo-018", role: "tester", name: "Clinician 18", firstName: "", lastName: "", email: "" },
  { id: "clinician19", password: "vertigo-019", role: "tester", name: "Clinician 19", firstName: "", lastName: "", email: "" },
  { id: "clinician20", password: "vertigo-020", role: "tester", name: "Clinician 20", firstName: "", lastName: "", email: "" },
  { id: "clinician21", password: "vertigo-021", role: "tester", name: "Clinician 21", firstName: "", lastName: "", email: "" },
  { id: "clinician22", password: "vertigo-022", role: "tester", name: "Clinician 22", firstName: "", lastName: "", email: "" },
  { id: "clinician23", password: "vertigo-023", role: "tester", name: "Clinician 23", firstName: "", lastName: "", email: "" },
  { id: "clinician24", password: "vertigo-024", role: "tester", name: "Clinician 24", firstName: "", lastName: "", email: "" },
  { id: "clinician25", password: "vertigo-025", role: "tester", name: "Clinician 25", firstName: "", lastName: "", email: "" },
  { id: "clinician26", password: "vertigo-026", role: "tester", name: "Clinician 26", firstName: "", lastName: "", email: "" },
  { id: "clinician27", password: "vertigo-027", role: "tester", name: "Clinician 27", firstName: "", lastName: "", email: "" },
  { id: "clinician28", password: "vertigo-028", role: "tester", name: "Clinician 28", firstName: "", lastName: "", email: "" },
  { id: "clinician29", password: "vertigo-029", role: "tester", name: "Clinician 29", firstName: "", lastName: "", email: "" },
  { id: "clinician30", password: "vertigo-030", role: "tester", name: "Clinician 30", firstName: "", lastName: "", email: "" },
  { id: "clinician31", password: "vertigo-031", role: "tester", name: "Clinician 31", firstName: "", lastName: "", email: "" },
  { id: "clinician32", password: "vertigo-032", role: "tester", name: "Clinician 32", firstName: "", lastName: "", email: "" },
  { id: "clinician33", password: "vertigo-033", role: "tester", name: "Clinician 33", firstName: "", lastName: "", email: "" },
  { id: "clinician34", password: "vertigo-034", role: "tester", name: "Clinician 34", firstName: "", lastName: "", email: "" },
  { id: "clinician35", password: "vertigo-035", role: "tester", name: "Clinician 35", firstName: "", lastName: "", email: "" },
  { id: "clinician36", password: "vertigo-036", role: "tester", name: "Clinician 36", firstName: "", lastName: "", email: "" },
  { id: "clinician37", password: "vertigo-037", role: "tester", name: "Clinician 37", firstName: "", lastName: "", email: "" },
  { id: "clinician38", password: "vertigo-038", role: "tester", name: "Clinician 38", firstName: "", lastName: "", email: "" },
  { id: "clinician39", password: "vertigo-039", role: "tester", name: "Clinician 39", firstName: "", lastName: "", email: "" },
  { id: "clinician40", password: "vertigo-040", role: "tester", name: "Clinician 40", firstName: "", lastName: "", email: "" },
  { id: "clinician41", password: "vertigo-041", role: "tester", name: "Clinician 41", firstName: "", lastName: "", email: "" },
  { id: "clinician42", password: "vertigo-042", role: "tester", name: "Clinician 42", firstName: "", lastName: "", email: "" },
  { id: "clinician43", password: "vertigo-043", role: "tester", name: "Clinician 43", firstName: "", lastName: "", email: "" },
  { id: "clinician44", password: "vertigo-044", role: "tester", name: "Clinician 44", firstName: "", lastName: "", email: "" },
  { id: "clinician45", password: "vertigo-045", role: "tester", name: "Clinician 45", firstName: "", lastName: "", email: "" },
  { id: "clinician46", password: "vertigo-046", role: "tester", name: "Clinician 46", firstName: "", lastName: "", email: "" },
  { id: "clinician47", password: "vertigo-047", role: "tester", name: "Clinician 47", firstName: "", lastName: "", email: "" },
  { id: "clinician48", password: "vertigo-048", role: "tester", name: "Clinician 48", firstName: "", lastName: "", email: "" },
  { id: "clinician49", password: "vertigo-049", role: "tester", name: "Clinician 49", firstName: "", lastName: "", email: "" },
  { id: "clinician50", password: "vertigo-050", role: "tester", name: "Clinician 50", firstName: "", lastName: "", email: "" },

  // ----- SOFTWARE-TEST ACCOUNTS (5) — behave like testers; shown in admin
  //       with a Delete-data button so dummy runs can be cleared. -----
  { id: "tester1", password: "test-001", role: "tester", name: "tester 1", firstName: "", lastName: "", email: "" },
  { id: "tester2", password: "test-002", role: "tester", name: "tester 2", firstName: "", lastName: "", email: "" },
  { id: "tester3", password: "test-003", role: "tester", name: "tester 3", firstName: "", lastName: "", email: "" },
  { id: "tester4", password: "test-004", role: "tester", name: "tester 4", firstName: "", lastName: "", email: "" },
  { id: "tester5", password: "test-005", role: "tester", name: "tester 5", firstName: "", lastName: "", email: "" },
];

export function findUser(id: string, password: string): User | null {
  const u = USERS.find((x) => x.id === id && x.password === password);
  return u ?? null;
}

export function getUser(id: string): User | null {
  return USERS.find((x) => x.id === id) ?? null;
}