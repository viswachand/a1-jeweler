// src/features/policies/policySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/services/axios";
import axios from "axios";

export interface Policy {
    id: string;
    title: string;
    description: string;
}

interface PolicyState {
    policies: Policy[];
    loading: boolean;
    error: string | null;
}

const initialState: PolicyState = {
    policies: [],
    loading: false,
    error: null,
};

// Create Policy
export const createPolicy = createAsyncThunk<
    Policy,
    { title: string; description: string; token: string },
    { rejectValue: string }
>("policies/create", async ({ title, description, token }, { rejectWithValue }) => {
    try {
        const response = await API.post<Policy>("/policy/create", { title, description }, {
            headers: { Authorization: `Bearer ${token}` },
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
        return rejectWithValue("Failed to create policy");
    }
});

// Fetch Policies
export const fetchPolicies = createAsyncThunk<
    Policy[],
    string,
    { rejectValue: string }
>("policies/fetch", async (token, { rejectWithValue }) => {
    try {
        const response = await API.get("/policy/get", {
            headers: { Authorization: `Bearer ${token}` },
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
        return rejectWithValue("Failed to fetch policies");
    }
});

// Delete Policy
export const deletePolicy = createAsyncThunk<
    string,
    { id: string; token: string },
    { rejectValue: string }
>("policies/delete", async ({ id, token }, { rejectWithValue }) => {
    try {
        await API.delete(`/policy/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return id;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const backendMessage =
                error.response?.data?.errors?.[0]?.message ||
                error.response?.data?.message ||
                error.message;

            console.error("[Login Axios Error]", backendMessage, error.response?.data);

            return rejectWithValue(backendMessage || "Login failed due to server error.");
        }
        return rejectWithValue("Failed to delete policy");
    }
});

// Update Policy
export const updatePolicy = createAsyncThunk<
    Policy,
    { id: string; title: string; description: string; token: string },
    { rejectValue: string }
>("policies/update", async ({ id, title, description, token }, { rejectWithValue }) => {
    try {
        const response = await API.put(`/policy/update/${id}`, { title, description }, {
            headers: { Authorization: `Bearer ${token}` },
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
        return rejectWithValue("Failed to update policy");
    }
});

const policySlice = createSlice({
    name: "policies",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Create
            .addCase(createPolicy.pending, (state) => {
                state.loading = true;
            })
            .addCase(createPolicy.fulfilled, (state, action) => {
                state.loading = false;
                state.policies.unshift(action.payload);
            })
            .addCase(createPolicy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error creating policy";
            })

            // Fetch
            .addCase(fetchPolicies.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPolicies.fulfilled, (state, action) => {
                state.loading = false;
                state.policies = action.payload;
            })
            .addCase(fetchPolicies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error fetching policies";
            })

            // Delete
            .addCase(deletePolicy.fulfilled, (state, action) => {
                state.policies = state.policies.filter((p) => p.id !== action.payload);
            })

            // Update
            .addCase(updatePolicy.fulfilled, (state, action) => {
                const index = state.policies.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) {
                    state.policies[index] = action.payload;
                }
            });
    },
});

export default policySlice.reducer;
