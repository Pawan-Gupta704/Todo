import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  loginRequest,
  registerRequest,
  getProfileRequest,
} from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const readStored = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = readStored("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  const persist = (token, userData, remember) => {
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    other.removeItem("token");
    other.removeItem("user");
    store.setItem("token", token);
    store.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const clear = () => {
    ["token", "user"].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    setUser(null);
  };

  useEffect(() => {
    const token = readStored("token");
    if (!token) {
      setLoading(false);
      return;
    }
    getProfileRequest()
      .then(({ data }) => setUser(data.user))
      .catch(() => clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, remember = true) => {
    const { data } = await loginRequest({ email, password });
    persist(data.token, data.user, remember);
    toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    persist(data.token, data.user, true);
    toast.success("Account created successfully");
    return data.user;
  };

  const logout = () => {
    clear();
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
