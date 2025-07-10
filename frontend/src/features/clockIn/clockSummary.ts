import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/services/axios";
import axios from "axios";

// --- Types ---
export interface UserClock {
    employeeName: {
        name: string;
        userID: number;
        id: string;
    };
    clockInTime: string;
    clockOutTime: string;
    totalHours: number;
}

interface ClockInState {
    clockRecords: UserClock[];
    loading: boolean;
    error: string | null;
}

// --- Initial State ---
const initialState: ClockInState = {
    clockRecords: [],
    loading: false,
    error: null,
};

// --- Thunks ---

export const getUserClock = createAsyncThunk<
    UserClock[],
    { id: string; token: string },
    { rejectValue: string }
>("clockIn/getUserClock", async ({ id, token }, { rejectWithValue }) => {
    try {
        const res = await API.get<UserClock[]>(`/clock/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(
                error.response.data?.errors?.[0]?.message ||
                error.response.data?.message ||
                "Failed to fetch user clock data"
            );
        }
        return rejectWithValue("Unexpected error while fetching user clock");
    }
});

export const getClockSummary = createAsyncThunk<
    UserClock[],
    string, // token
    { rejectValue: string }
>("clockIn/getClockSummary", async (token, { rejectWithValue }) => {
    try {
        const res = await API.get<UserClock[]>("/clock/clockSummary", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(
                error.response.data?.errors?.[0]?.message ||
                error.response.data?.message ||
                "Failed to fetch clock summary"
            );
        }
        return rejectWithValue("Unexpected error while fetching summary");
    }
});

// --- Slice ---
const clockSummarySlice = createSlice({
    name: "clockSummary",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getUserClock
            .addCase(getUserClock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserClock.fulfilled, (state, action) => {
                state.loading = false;
                state.clockRecords = action.payload;
            })
            .addCase(getUserClock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Unable to load clock data";
            })

            // getClockSummary
            .addCase(getClockSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getClockSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.clockRecords = action.payload;
            })
            .addCase(getClockSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Unable to load summary";
            });
    },
});

export default clockSummarySlice.reducer;
