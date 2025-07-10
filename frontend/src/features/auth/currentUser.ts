import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "@/app/store";

// Types
export interface User {
    userID: number;
    name: string;
    id: string;
    admin: boolean;
}

interface AuthState {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    currentUser: null,
    isLoading: false,
    error: null,
};

// Axios base config
const API = axios.create({
    baseURL: "http://localhost:4000/api",
});

// Thunk: Fetch user info using Bearer token
export const fetchCurrentUser = createAsyncThunk<
    User | null,
    string,
    { rejectValue: string }
>("auth/fetchCurrentUser", async (token, { rejectWithValue }) => {
    try {
        const res = await API.get<{ currentUser: User }>("/users/currentuser", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data?.currentUser || null;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(
                error.response.data?.errors?.[0]?.message ||
                error.response.data?.message ||
                "Unable to fetch user"
            );
        }
        return rejectWithValue("Unable to fetch user");
    }
});

// Slice
const currentUserSlice = createSlice({
    name: "currentUser",
    initialState,
    reducers: {
        clearAuthError(state) {
            state.error = null;
        },
        clearCurrentUser(state) {
            state.currentUser = null;
        },
        logout(state) {
            state.currentUser = null;
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Unable to fetch user";
            });
    },
});

export const { clearAuthError, clearCurrentUser, logout } = currentUserSlice.actions;

// Selector
export const selectCurrentUser = (state: RootState) => state.user.currentUser;

export default currentUserSlice.reducer;
