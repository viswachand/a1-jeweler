import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface User {
    userID: number;
    name: string;
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

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/users',
    withCredentials: true,
});

export const loginUser = createAsyncThunk<
    User,
    { userID: number; password: number },
    { rejectValue: string }
>('auth/loginUser', async ({ userID, password }, { rejectWithValue }) => {
    try {
        await API.post('/users/login', { userID, password });
        const res = await API.get<{ currentUser: User }>('/users/currentuser');
        return res.data.currentUser;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data?.errors?.[0]?.message || 'Login failed');
        }
        return rejectWithValue('Login failed');
    }
});

export const fetchCurrentUser = createAsyncThunk<
    User | null,
    void,
    { rejectValue: string }
>('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
    try {
        const res = await API.get<{ currentUser: User }>('/users/currentuser');
        return res.data?.currentUser || null;
    } catch (error: unknown) {
        return rejectWithValue('Unable to fetch user');
    }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
    await API.get('/users/logout');
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError(state) {
            state.error = null;
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
                state.currentUser = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Login failed';
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Unable to fetch user';
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.currentUser = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.error = 'Logout failed';
            });
    },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
