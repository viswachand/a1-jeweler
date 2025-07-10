import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCurrentUser } from "@/features/auth/currentUser";
import type { RootState } from "@/app/store";

interface ValidationParams {
    userID: string;
    token: string;
}

export const validateRingSaleAccess = createAsyncThunk<
    boolean,
    ValidationParams,
    { state: RootState }
>(
    "auth/validateRingSaleAccess",
    async ({ userID, token }, { dispatch, getState }) => {
        await dispatch(fetchCurrentUser(token)).unwrap();

        const isClockedIn = getState().clock.usersClockData[userID]?.isClockedIn;

        if (!isClockedIn) {
            throw new Error("You must be clocked in to access Ring Sale.");
        }

        return isClockedIn;
    }
);
