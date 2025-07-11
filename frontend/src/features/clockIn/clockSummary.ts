import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/services/axios";
import type { RootState } from "@/app/store";
import axios from "axios";

// --- Types ---
export interface ClockPunch {
    clockInTime: string | null;
    clockOutTime: string | null;
    totalHours: number;
}

export interface ClockSummaryEntry {
    user: {
        userID: number;
        name: string;
    };
    clockedIn: boolean;
    clockInTime: string | null;
    clockOutTime: string | null;
    punches: ClockPunch[];
}

export type ClockedInSummary = Record<string, ClockSummaryEntry>;

// Optional: If `UserClock[]` is used elsewhere in your app (not here), keep it.
// Otherwise, it's safe to move it to a different slice or module.
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

// --- Slice State ---
interface ClockInState {
    clockRecords: UserClock[]; // Detailed clock records per user
    summaryByUser: ClockedInSummary; // Aggregated summary map
    loading: boolean;
    error: string | null;
}

const initialState: ClockInState = {
    clockRecords: [],
    summaryByUser: {},
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
    ClockedInSummary,
    void,
    { rejectValue: string }
>("clockSummary/getClockSummary", async (_, { rejectWithValue }) => {
    try {
        const res = await API.get<ClockedInSummary>("/clock/clockSummary");
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
                state.summaryByUser = action.payload;
            })
            .addCase(getClockSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Unable to load summary";
            });
    },
});

export const selectUserClockStatus = (state: RootState, id: string): boolean | null => {
    if (!id) return null;
    return state.clockSummary.summaryByUser?.[id]?.clockedIn ?? null;
};

export default clockSummarySlice.reducer;
