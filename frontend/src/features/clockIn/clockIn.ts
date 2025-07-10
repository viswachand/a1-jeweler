import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define types
interface ClockRecord {
    clockInTime: string;
    clockOutTime: string | null;
    totalHours: number | null;
}

interface ClockInState {
    usersClockData: {
        [userID: string]: {
            isClockedIn: boolean;
            clockInRecord: ClockRecord[];
        };
    };
    loading: boolean;
    error: string | null;
}

const initialState: ClockInState = {
    usersClockData: {},
    loading: false,
    error: null,
};

// Helper to update user clock state locally
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
        }
        user.isClockedIn = isClockedIn;
    } else {
        state.usersClockData[userID] = {
            isClockedIn,
            clockInRecord: [newClockRecord],
        };
    }
};

// Async thunk for clocking in
export const clockIn = createAsyncThunk<
    ClockInState,
    { id: string; token: string },
    { rejectValue: string }
>("clockIn/clockIn", async ({ id, token }, { rejectWithValue }) => {
    try {

        const res = await axios.get(`http://localhost:4000/api/clock/clockIn/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 201) {
            return {
                usersClockData: {
                    [id]: {
                        isClockedIn: res.data.clockedIn,
                        clockInRecord: [
                            {
                                clockInTime: res.data.clockInRecord.clockInTime,
                                clockOutTime: null,
                                totalHours: 0,
                            },
                        ],
                    },
                },
                loading: false,
                error: null,
            };
        } else {
            return rejectWithValue("Clock-in failed");
        }
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return rejectWithValue(err.response.data?.message || "Clock-in failed");
        }
        return rejectWithValue("Clock-in failed");
    }
});

// Async thunk for clocking out
export const clockOut = createAsyncThunk<
    ClockInState,
    { id: string; token: string },
    { rejectValue: string }
>("clockIn/clockOut", async ({ id, token }, { rejectWithValue }) => {
    try {
        const res = await axios.get(`http://localhost:4000/api/clock/clockOut/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 200) {
            return {
                usersClockData: {
                    [id]: {
                        isClockedIn: false,
                        clockInRecord: [
                            {
                                clockInTime: res.data.clockInRecord.clockInTime,
                                clockOutTime: res.data.clockInRecord.clockOutTime,
                                totalHours: res.data.clockInRecord.totalHours,
                            },
                        ],
                    },
                },
                loading: false,
                error: null,
            };
        } else {
            return rejectWithValue("Clock-out failed");
        }
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return rejectWithValue(err.response.data?.message || "Clock-out failed");
        }
        return rejectWithValue("Clock-out failed");
    }
});

// Slice
const clockInSlice = createSlice({
    name: "clockIn",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            // CLOCK-IN
            .addCase(clockIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clockIn.fulfilled, (state, action) => {
                state.loading = false;
                const newClockRecords = action.payload.usersClockData;
                for (const [userID, record] of Object.entries(newClockRecords)) {
                    updateUserClockData(state, userID, record.clockInRecord[0], true);
                }
            })
            .addCase(clockIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Clock-in error";
            })

            // CLOCK-OUT
            .addCase(clockOut.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clockOut.fulfilled, (state, action) => {
                state.loading = false;
                const newClockRecords = action.payload.usersClockData;
                for (const [userID, record] of Object.entries(newClockRecords)) {
                    updateUserClockData(state, userID, record.clockInRecord[0], false);
                }
            })
            .addCase(clockOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Clock-out error";
            });
    },
});

export default clockInSlice.reducer;
