// @refresh reset
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import { User, AuthState } from "../types";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  firebaseUid?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Set up Firebase listeners only
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          role: "user",
        };
        localStorage.setItem("authToken", token);
        dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
      } else {
        localStorage.removeItem("authToken");
        dispatch({ type: "LOGOUT" });
      }
      dispatch({ type: "SET_LOADING", payload: false });
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      const userInfo: User = {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || user.email?.split("@")[0] || "",
        role: "user",
      };
      localStorage.setItem("authToken", token);
      dispatch({ type: "LOGIN_SUCCESS", payload: { user: userInfo, token } });
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      const token = await user.getIdToken();
      const userInfo: User = {
        id: user.uid,
        email: user.email || "",
        name: name,
        role: "user",
      };
      localStorage.setItem("authToken", token);
      dispatch({ type: "LOGIN_SUCCESS", payload: { user: userInfo, token } });
    } catch (error: any) {
      console.error("Signup error:", error);
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Always clear the token from localStorage
      localStorage.removeItem("authToken");
      dispatch({ type: "LOGOUT" });
      // Try to sign out from Firebase (will do nothing in dev mode)
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout failed", error);
    }
  };

  const contextValue = useMemo(
    () => ({ state, login, signup, logout }),
    [state]
  );

  return (
    <AuthContext.Provider
      value={{ ...contextValue, firebaseUid: state.user?.id }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { useAuth };
