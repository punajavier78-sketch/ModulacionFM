export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant regex for standard email addresses
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

export function validateLoginForm(email: string, password: string): {
  isValid: boolean;
  errors: { email?: string; password?: string; general?: string };
} {
  const errors: { email?: string; password?: string; general?: string } = {};

  if (!email.trim()) {
    errors.email = 'El correo electrónico es requerido.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Ingrese un formato de correo electrónico válido (ejemplo: usuario@correo.com).';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): {
  isValid: boolean;
  errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
} {
  const errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  if (!name.trim()) {
    errors.name = 'El nombre completo es requerido.';
  } else if (name.trim().length < 3) {
    errors.name = 'El nombre completo debe tener al menos 3 caracteres.';
  }

  if (!email.trim()) {
    errors.email = 'El correo electrónico es requerido.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Ingrese un formato de correo electrónico válido (ejemplo: usuario@correo.com).';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida.';
  } else if (password.length < 6) {
    errors.password = 'La contraseña debe tener un mínimo de 6 caracteres.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Debe confirmar su contraseña.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden. Verifique ambos campos.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
