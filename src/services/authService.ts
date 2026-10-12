import { AuthResult, AuthSession, StoredUser, User } from '../types/auth';

const STORAGE_USERS_KEY = 'fm_lab_registered_users_v1';
const STORAGE_SESSION_KEY = 'fm_lab_active_session_v1';

// Cryptographic hash using Web Crypto API SHA-256 with salt
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '::salt::' + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Default pre-seeded test accounts
async function getInitialUsers(): Promise<StoredUser[]> {
  const salt1 = 'salt_upea_estudiante_2026';
  const salt2 = 'salt_upea_docente_2026';
  const passHash1 = await hashPassword('Fm2026!*', salt1);
  const passHash2 = await hashPassword('Docente2026!*', salt2);

  return [
    {
      id: 'usr_docente_01',
      name: 'MSc. Ing. Daniel Puña',
      email: 'daniel.puna@upea.edu.bo',
      passwordHash: passHash2,
      salt: salt2,
      role: 'Docente Titular',
      institution: 'Universidad Pública de El Alto (UPEA)',
      career: 'Ingeniería Electrónica',
      teacher: 'MSc. Ing. Daniel Puña',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_estudiante_01',
      name: 'Estudiante Universitario',
      email: 'estudiante.upea@upea.edu.bo',
      passwordHash: passHash1,
      salt: salt1,
      role: 'Estudiante de Telecomunicaciones',
      institution: 'Universidad Pública de El Alto (UPEA)',
      career: 'Ingeniería Electrónica',
      teacher: 'MSc. Ing. Daniel Puña',
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function getStoredUsers(): Promise<StoredUser[]> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      const initial = await getInitialUsers();
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = await getInitialUsers();
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch (error) {
    console.error('Error al leer usuarios de almacenamiento local:', error);
    const initial = await getInitialUsers();
    return initial;
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const trimmedName = data.name.trim();
  const normalizedEmail = data.email.trim().toLowerCase();
  const password = data.password;

  if (!trimmedName) {
    return { success: false, message: 'El nombre completo es obligatorio.' };
  }
  if (!normalizedEmail) {
    return { success: false, message: 'El correo electrónico es obligatorio.' };
  }
  if (!password) {
    return { success: false, message: 'La contraseña es obligatoria.' };
  }

  const users = await getStoredUsers();
  const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    return {
      success: false,
      message: 'Ya existe una cuenta registrada con este correo electrónico. Inicie sesión.',
    };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser: StoredUser = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
    salt,
    role: 'Estudiante de Telecomunicaciones',
    institution: 'Universidad Pública de El Alto (UPEA)',
    career: 'Ingeniería Electrónica',
    teacher: 'MSc. Ing. Daniel Puña',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

  const safeUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    institution: newUser.institution,
    career: newUser.career,
    teacher: newUser.teacher,
    createdAt: newUser.createdAt,
  };

  return {
    success: true,
    message: 'Cuenta registrada exitosamente. Ahora puede iniciar sesión con sus credenciales.',
    user: safeUser,
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { success: false, message: 'Por favor, ingrese su correo electrónico.' };
  }
  if (!password) {
    return { success: false, message: 'Por favor, ingrese su contraseña.' };
  }

  const users = await getStoredUsers();
  const matchedUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!matchedUser) {
    return {
      success: false,
      message: 'No se encontró ninguna cuenta registrada con este correo electrónico.',
    };
  }

  const computedHash = await hashPassword(password, matchedUser.salt);
  if (computedHash !== matchedUser.passwordHash) {
    return {
      success: false,
      message: 'Contraseña incorrecta. Verifique sus credenciales e intente de nuevo.',
    };
  }

  const sessionUser: User = {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role,
    institution: matchedUser.institution,
    career: matchedUser.career,
    teacher: matchedUser.teacher,
    createdAt: matchedUser.createdAt,
  };

  const session: AuthSession = {
    user: sessionUser,
    token: 'tok_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10),
    loginTimestamp: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

  return {
    success: true,
    message: 'Acceso verificado. ¡Bienvenido al laboratorio de modulación FM!',
    user: sessionUser,
    session,
  };
}

export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch (e) {
    console.error('Error al recuperar sesión activa:', e);
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}
