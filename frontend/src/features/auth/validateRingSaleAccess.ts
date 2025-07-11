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
    const token = userID ? getState().auth.loggedInuser[userID]?.token : null;
    if (!token) throw new Error("Missing token");

    console.log(userID)

    await dispatch(fetchCurrentUser(token)).unwrap();

    const isClockedIn =
        getState().clockSummary.summaryByUser?.[userID]?.clockedIn ?? null;

    return isClockedIn;
});
