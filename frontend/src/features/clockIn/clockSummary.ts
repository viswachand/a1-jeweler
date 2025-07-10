import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- Types ---
interface UserClock {
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

export const getUserClock = createAsyncThunk<
    UserClock[],
    { id: string; token: string },
    { rejectValue: string }
>("clockIn/getUserClock", async ({ id, token }, { rejectWithValue }) => {
    try {
        const res = await axios.get<UserClock[]>(
            `http://localhost:4000/api/clock/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(
                error.response.data?.message || "Failed to fetch clock-in data"
            );
        }
        return rejectWithValue("Failed to fetch clock-in data");
    }
});

// ✅ Get clock summary for all users (admin only)
export const getClockSummary = createAsyncThunk<
    UserClock[],
    string, // token
    { rejectValue: string }
>("clockIn/getClockSummary", async (token, { rejectWithValue }) => {
    try {
        const res = await axios.get<UserClock[]>(
            `http://localhost:4000/api/clock/clockSummary`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(
                error.response.data?.message || "Failed to fetch summary"
            );
        }
        return rejectWithValue("Failed to fetch summary");
    }
});

const clockSummarySlice = createSlice({
    name: "clockSummary",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Handle getUserClock
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
                state.error = action.payload || "Could not load clock records";
            })

            // Handle getClockSummary
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
                state.error = action.payload || "Could not load summary";
            });
    },
});

export default clockSummarySlice.reducer;
