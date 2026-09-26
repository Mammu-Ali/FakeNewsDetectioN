import { loginUser, registerUser } from './api';

export const login = async (email, password) => {
  const response = await loginUser(email, password);
  // Store JWT token separately for the Axios interceptor
  if (response.access_token) {
    localStorage.setItem('truthguard_token', response.access_token);
  }
  return {
    user: response.user,
    token: response.access_token,
  };
};

export const register = async (name, email, password) => {
  const response = await registerUser(name, email, password);
  // Register now also returns a token so the user is immediately logged in
  if (response.access_token) {
    localStorage.setItem('truthguard_token', response.access_token);
  }
  return {
    user: response.user,
    token: response.access_token,
  };
};

// Keep these exports for any legacy callers
export const mockLogin = login;
export const mockRegister = register;
