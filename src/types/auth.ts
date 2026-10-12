export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  career: string;
  teacher: string;
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  loginTimestamp: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: User;
  session?: AuthSession;
}
