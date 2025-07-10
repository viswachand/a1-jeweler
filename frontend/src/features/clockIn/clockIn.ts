import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/services/axios";
import axios from "axios";

// --- Types ---
interface ClockRecord {
    clockInTime: string;
    clockOutTime: string | null;
    totalHours: number | null;
}

interface UserClockData {
    isClockedIn: boolean;
    clockInRecord: ClockRecord[];
}

interface ClockInState {
    usersClockData: Record<string, UserClockData>;
    loading: boolean;
    error: string | null;
}

const initialState: ClockInState = {
    usersClockData: {},
    loading: false,
    error: null,
};

// --- Helper ---
const updateUserClockData = (
    state: ClockInState,
    userID: string,
    newClockRecord: ClockRecord,
    isClockedIn: boolean
) => {
    const user = state.usersClockData[userID];

    if (user) {
        const lastRecord = user.clockInRecord[user.clockInRecord.length - 1];
        if (lastRecord && lastRecord.clockOutTime === null && !isClockedIn) {
            lastRecord.clockOutTime = newClockRecord.clockOutTime;
            lastRecord.totalHours = newClockRecord.totalHours;
        } else {
            user.clockInRecord.push(newClockRecord); // clock-in again
        }
        user.isClockedIn = isClockedIn;
    } else {
        state.usersClockData[userID] = {
            isClockedIn,
            clockInRecord: [newClockRecord],
        };
    }
};

// --- Thunks ---
export const clockIn = createAsyncThunk<
    ClockRecord,
    { id: string; token: string },
    { rejectValue: string }
>("clockIn/clockIn", async ({ id, token }, { rejectWithValue }) => {
    try {
        const res = await API.get(`/clock/clockIn/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 201 && res.data?.clockInRecord?.clockInTime) {
            return {
                clockInTime: res.data.clockInRecord.clockInTime,
                clockOutTime: null,
                totalHours: null,
            };
        }

        return rejectWithValue("Invalid clock-in response");
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return rejectWithValue(
                err.response.data?.message || "Clock-in failed"
            );
        }
        return rejectWithValue("Clock-in failed due to unexpected error");
    }
});

export const clockOut = createAsyncThunk<
    ClockRecord,
    { id: string; token: string },
    { rejectValue: string }
>("clockIn/clockOut", async ({ id, token }, { rejectWithValue }) => {
    try {
        const res = await API.get(`/clock/clockOut/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (
            res.status === 200 &&
            res.data?.clockInRecord?.clockOutTime &&
            res.data?.clockInRecord?.totalHours
        ) {
            return {
                clockInTime: res.data.clockInRecord.clockInTime,
                clockOutTime: res.data.clockInRecord.clockOutTime,
                totalHours: res.data.clockInRecord.totalHours,
            };
        }

        return rejectWithValue("Invalid clock-out response");
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return rejectWithValue(
                err.response.data?.message || "Clock-out failed"
            );
        }
        return rejectWithValue("Clock-out failed due to unexpected error");
    }
});

// --- Slice ---
const clockInSlice = createSlice({
    name: "clockIn",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Clock-In
            .addCase(clockIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clockIn.fulfilled, (state, action) => {
                state.loading = false;
                const record = action.payload;
                const userID = record.clockInTime.split("-")[0]; // If userID isn't passed, extract logic here or thunk
                updateUserClockData(state, userID, record, true);
            })
            .addCase(clockIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Clock-in error";
            })

            // Clock-Out
            .addCase(clockOut.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clockOut.fulfilled, (state, action) => {
                state.loading = false;
                const record = action.payload;
                const userID = record.clockInTime.split("-")[0]; // Extract logic here if needed
                updateUserClockData(state, userID, record, false);
            })
            .addCase(clockOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Clock-out error";
            });
    },
});

export default clockInSlice.reducer;
