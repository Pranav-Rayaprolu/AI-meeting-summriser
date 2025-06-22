// @refresh reset
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Meeting, ActionItem, Analytics } from "../types";
import * as api from "../services/api";
import { useAuth } from "./AuthContext";
import { getUuidUserId } from "../services/api";

interface AppState {
  meetings: Meeting[];
  actionItems: ActionItem[];
  analytics: Analytics | null;
  isLoading: boolean;
  error: string | null;
}

interface AppContextType {
  state: AppState;
  addMeeting: (formData: FormData) => Promise<void>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => Promise<void>;
  fetchMeetings: () => Promise<void>;
  fetchActionItems: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

type AppAction =
  | { type: "SET_MEETINGS"; payload: Meeting[] }
  | { type: "ADD_MEETING"; payload: Meeting }
  | {
      type: "UPDATE_MEETING";
      payload: { id: string; updates: Partial<Meeting> };
    }
  | { type: "SET_ACTION_ITEMS"; payload: ActionItem[] }
  | {
      type: "UPDATE_ACTION_ITEM";
      payload: { id: string; updates: Partial<ActionItem> };
    }
  | { type: "SET_ANALYTICS"; payload: Analytics }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_MEETINGS":
      return { ...state, meetings: action.payload };
    case "ADD_MEETING":
      return { ...state, meetings: [action.payload, ...state.meetings] };
    case "UPDATE_MEETING":
      return {
        ...state,
        meetings: state.meetings.map((meeting) =>
          meeting.id === action.payload.id
            ? { ...meeting, ...action.payload.updates }
            : meeting
        ),
      };
    case "SET_ACTION_ITEMS":
      return { ...state, actionItems: action.payload };
    case "UPDATE_ACTION_ITEM":
      return {
        ...state,
        actionItems: state.actionItems.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };
    case "SET_ANALYTICS":
      return { ...state, analytics: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState: AppState = {
  meetings: [],
  actionItems: [],
  analytics: null,
  isLoading: true,
  error: null,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { state: authState } = useAuth();

  const fetchMeetings = useMemo(
    () => async () => {
      try {
        const response = await api.getMeetings();
        // Convert date strings to Date objects
        const meetings = response.data.map((m: any) => ({
          ...m,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        }));
        dispatch({ type: "SET_MEETINGS", payload: meetings });
      } catch (error: any) {
        console.error("Error fetching meetings:", error);
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Failed to fetch meetings.",
        });
      }
    },
    []
  );

  const fetchActionItems = useMemo(
    () => async () => {
      try {
        const response = await api.getActionItems();
        // Convert date strings to Date objects
        const actionItems = response.data.map((item: any) => ({
          ...item,
          deadline: item.deadline ? new Date(item.deadline) : null,
          createdAt: item.createdAt ? new Date(item.createdAt) : null,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
          completion_time: item.completion_time
            ? new Date(item.completion_time)
            : null,
        }));
        dispatch({ type: "SET_ACTION_ITEMS", payload: actionItems });
      } catch (error: any) {
        console.error("Error fetching action items:", error);
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Failed to fetch action items.",
        });
      }
    },
    []
  );

  const fetchAnalytics = useMemo(
    () => async () => {
      try {
        const response = await api.getAnalytics();
        dispatch({ type: "SET_ANALYTICS", payload: response.data });
      } catch (error: any) {
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Failed to fetch analytics.",
        });
      }
    },
    []
  );

  const fetchInitialData = useMemo(
    () => async () => {
      if (!authState.isAuthenticated) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        await Promise.all([
          fetchMeetings(),
          fetchActionItems(),
          fetchAnalytics(),
        ]);
      } catch (error: any) {
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Failed to fetch initial data.",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [authState.isAuthenticated, fetchMeetings, fetchActionItems, fetchAnalytics]
  );

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const addMeeting = useMemo(
    () => async (formData: FormData) => {
      if (authState.user) {
        formData.set("user_id", getUuidUserId(authState.user.id));
      }
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await api.uploadMeeting(formData);
        const transformedMeeting = {
          id: response.data.meeting_id,
          title: response.data.title,
          transcript: response.data.transcript || "",
          summary: response.data.summary,
          createdAt: new Date(response.data.created_at),
          userId: response.data.user_id,
          status: response.data.status,
          processingProgress: response.data.processing_progress,
        };
        dispatch({ type: "ADD_MEETING", payload: transformedMeeting });

        // Poll for updates since processing happens asynchronously
        let attempts = 0;
        const maxAttempts = 10; // Poll for up to 30 seconds

        const pollForUpdates = async () => {
          if (attempts >= maxAttempts) {
            console.log("Polling completed - max attempts reached");
            return;
          }

          try {
            console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
            await Promise.all([fetchActionItems(), fetchAnalytics()]);

            // Wait 3 seconds before next attempt
            setTimeout(() => {
              attempts++;
              pollForUpdates();
            }, 3000);
          } catch (error) {
            console.error("Error polling for updates:", error);
          }
        };

        // Start polling after a short delay
        setTimeout(pollForUpdates, 2000);
      } catch (error: any) {
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Failed to upload meeting.",
        });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [fetchActionItems, fetchAnalytics, authState.user]
  );

  const updateMeeting = useMemo(
    () => (id: string, updates: Partial<Meeting>) => {
      dispatch({ type: "UPDATE_MEETING", payload: { id, updates } });
    },
    []
  );

  const updateActionItem = useMemo(
    () => async (id: string, updates: Partial<ActionItem>) => {
      try {
        const response = await api.updateActionItem(id, updates);
        dispatch({
          type: "UPDATE_ACTION_ITEM",
          payload: { id, updates: response.data },
        });
      } catch (error: any) {
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Failed to update action item.",
        });
        throw error;
      }
    },
    []
  );

  const createActionItem = useMemo(
    () => async (meetingId: string, data: Partial<ActionItem>) => {
      if (!authState.user) throw new Error("User not authenticated");
      const user_id = getUuidUserId(authState.user.id);
      return await api.createActionItem(meetingId, { ...data, user_id });
    },
    [authState.user]
  );

  const contextValue = useMemo(
    () => ({
      state,
      addMeeting,
      updateMeeting,
      updateActionItem,
      fetchMeetings,
      fetchActionItems,
      fetchAnalytics,
    }),
    [
      state,
      addMeeting,
      updateMeeting,
      updateActionItem,
      fetchMeetings,
      fetchActionItems,
      fetchAnalytics,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <ThemeProvider>{children}</ThemeProvider>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
