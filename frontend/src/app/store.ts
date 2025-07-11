import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "@/features/auth/authSlice";
import currentUserReducer from "@/features/auth/currentUser";
import categoryReducer from "@/features/categories/categorySlice";
import policyReducer from "@/features/policy/policySlice";
import itemsReducer from "@/features/items/itemSlice";
import clockReducer from "@/features/clockIn/clockIn";
import clockSummaryReducer from "@/features/clockIn/clockSummary";


const persistConfig = {
    key: "root",
    storage,
    whitelist: ["user", "clock", "auth"],
};

const rootReducer = combineReducers({
    auth: authReducer,
    user: currentUserReducer,
    categories: categoryReducer,
    policies: policyReducer,
    items: itemsReducer,
    clock: clockReducer,
    clockSummary: clockSummaryReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Required by redux-persist to avoid middleware warnings
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== "production",
});


export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
