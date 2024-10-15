import csrf from 'csrf';

const tokens = new csrf();

export function createCsrfToken() {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  
  return { csrfToken: token, secret };
}

export function validateCsrfToken(cookies, token) {
  const secretCookie = cookies.get('csrf-secret');
  if (!secretCookie) {
    console.error('CSRF secret not found in cookies.');
    return false;
  }
  const secret = secretCookie.value;
  const isValid = tokens.verify(secret, token);
  if (!isValid) {
    console.error('CSRF token verification failed.');
  }
  return isValid;
}
