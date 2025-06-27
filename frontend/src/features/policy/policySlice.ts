// src/features/policies/policySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Types
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

// API Base
const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// Thunks

export const createPolicy = createAsyncThunk<
    Policy,
    { title: string; description: string },
    { rejectValue: string }
>("policies/create", async (data, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_BASE}/policy/create`, data, {
            withCredentials: true,
        });
        console.log(response);
        return response.data;
    } catch (error: unknown) {
        console.log(error);
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(
                error.response.data.errors[0]?.message || "Failed to create policy"
            );
        }
        return rejectWithValue("Failed to create policy");
    }
});

export const fetchPolicies = createAsyncThunk<
    Policy[],
    void,
    { rejectValue: string }
>("policies/fetch", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_BASE}/policy/get`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(
                error.response.data.errors[0]?.message || "Failed to fetch policies"
            );
        }
        return rejectWithValue("Failed to fetch policies");
    }
});

export const deletePolicy = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("policies/delete", async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${API_BASE}/policy/delete/${id}`, {
            withCredentials: true,
        });
        return id;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(
                error.response.data.errors[0]?.message || "Failed to delete policy"
            );
        }
        return rejectWithValue("Failed to delete policy");
    }
});

// Update Policy
export const updatePolicy = createAsyncThunk<
    Policy,
    { id: string; title: string; description: string },
    { rejectValue: string }
>(
    "policies/update",
    async ({ id, title, description }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE}/policy/update/${id}`,
                { id, title, description },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(
                    error.response.data.errors[0]?.message || "Failed to update policy"
                );
            }
            return rejectWithValue("Failed to update policy");
        }
    }
);

// Slice
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
            });

        // // Delete
        // .addCase(deletePolicy.fulfilled, (state, action) => {
        //     state.policies = state.policies.filter((p) => p._id !== action.payload);
        // })

        // // Update
        // .addCase(updatePolicy.fulfilled, (state, action) => {
        //     const index = state.policies.findIndex((p) => p._id === action.payload._id);
        //     if (index !== -1) {
        //         state.policies[index] = action.payload;
        //     }
        // });
    },
});

export default policySlice.reducer;
