import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { API } from "@/services/axios";
import axios from "axios";

// Types
export interface User {
    userID: number;
    name: string;
    id: string;
    admin: boolean;
}

interface UserSession {
    user: User;
    token: string;
}

interface AuthState {
    loggedInuser: {
        [id: string]: UserSession;
    };
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    loggedInuser: {},
    isLoading: false,
    error: null,
};

// Async thunk for logging in a user
interface LoginRequest {
    userID: number;
    password: number;
}

interface LoginResponse {
    token: string;
    user: User;
}

export const loginUser = createAsyncThunk<
    LoginResponse,
    LoginRequest,
    { rejectValue: string }
>("auth/loginUser", async ({ userID, password }, { rejectWithValue }) => {
    try {
        const response = await API.post<LoginResponse>("/users/login", {
            userID,
            password,
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const backendMessage =
                error.response?.data?.errors?.[0]?.message ||
                error.response?.data?.message ||
                error.message;

            console.error("[Login Axios Error]", backendMessage, error.response?.data);

            return rejectWithValue(backendMessage || "Login failed due to server error.");
        }

        console.error("[Login Unknown Error]", error);
        return rejectWithValue("Unexpected error during login.");
    }
});


// Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuthError(state) {
            state.error = null;
        },
        logoutUserById(state, action) {
            delete state.loggedInuser[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const { user, token } = action.payload;
                if (!state.loggedInuser) {
                    state.loggedInuser = {};
                }
                state.loggedInuser[user.id] = { user, token };
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Login failed";
            });
    },
});

// Actions
export const { clearAuthError, logoutUserById } = authSlice.actions;

// Selectors
export const selectUserById = (state: RootState, id: string) =>
    state.auth.loggedInuser?.[id]?.user ?? null;

export const selectTokenById = (state: RootState, id: string) =>
    state.auth.loggedInuser?.[id]?.token ?? null;

export default authSlice.reducer;
