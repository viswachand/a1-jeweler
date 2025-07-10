import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCurrentUser } from "@/features/auth/currentUser";
import type { RootState } from "@/app/store";

interface ValidationParams {
    userID: string;
}

export const validateRingSaleAccess = createAsyncThunk<
    boolean,
    ValidationParams,
    { state: RootState }
>("auth/validateRingSaleAccess", async ({ userID }, { dispatch, getState }) => {
    const token = getState().auth.loggedInuser[userID]?.token;
    await dispatch(fetchCurrentUser(token)).unwrap();
    const isClockedIn = getState().clock.usersClockData[userID]?.isClockedIn;

    if (!isClockedIn) {
        throw new Error("You must be clocked in to access Ring Sale.");
    }

    return isClockedIn;
});
