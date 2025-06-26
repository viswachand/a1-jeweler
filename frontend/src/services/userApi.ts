import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'

export interface User {
    userID: number
    name: string
    admin: boolean
}

interface AuthState {
    currentUser: User | null
    loading: boolean
    error: string | null
}

interface ErrorDetail {
    message: string
    field?: string
}

interface ErrorResponse {
    errors: ErrorDetail[]
}

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/users',
    withCredentials: true,
})

const initialState: AuthState = {
    currentUser: null,
    loading: false,
    error: null,
}

export const userLogin = createAsyncThunk<
    User,
    { userID: number; password: number },
    { rejectValue: string }
>('auth/login', async ({ userID, password }, { rejectWithValue }) => {
    try {
        await API.post('/login', { userID, password })
        const res = await API.get<{ currentUser: User }>('/currentuser')
        return res.data.currentUser
    } catch (err) {
        const error = err as AxiosError<ErrorResponse>
        return rejectWithValue(error.response?.data?.errors?.[0]?.message || 'Login failed')
    }
})

export const userSignUp = createAsyncThunk<
    User,
    { name: string; userID: number; password: string; admin?: boolean },
    { rejectValue: string }
>('auth/signup', async ({ name, userID, password, admin = false }, { rejectWithValue }) => {
    try {
        await API.post('/signup', { name, userID, password, admin })
        const res = await API.get<{ currentUser: User }>('/currentuser')
        return res.data.currentUser
    } catch (err) {
        const error = err as AxiosError<ErrorResponse>
        return rejectWithValue(error.response?.data?.errors?.[0]?.message || 'Sign up failed')
    }
})

export const fetchCurrentUser = createAsyncThunk<
    User | null,
    void,
    { rejectValue: string }
>('auth/currentUser', async (_, { rejectWithValue }) => {
    try {
        const res = await API.get<{ currentUser: User | null }>('/currentuser')
        return res.data.currentUser
    } catch (err) {
        return rejectWithValue('Unable to fetch user')
    }
})

export const userLogout = createAsyncThunk('auth/logout', async () => {
    await API.post('/logout')
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(userLogin.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(userLogin.fulfilled, (state, action) => {
                state.loading = false
                state.currentUser = action.payload
            })
            .addCase(userLogin.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Login failed'
            })

            // Signup
            .addCase(userSignUp.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(userSignUp.fulfilled, (state, action) => {
                state.loading = false
                state.currentUser = action.payload
            })
            .addCase(userSignUp.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Signup failed'
            })

            // Current User
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.currentUser = action.payload
            })

            // Logout
            .addCase(userLogout.fulfilled, (state) => {
                state.currentUser = null
            })
    },
})

export const { clearAuthError } = authSlice.actions

export default authSlice.reducer
