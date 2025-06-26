import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Category {
    id: string;
    name: string;
}

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
};

export const addCategory = createAsyncThunk<
    Category, // response
    { name: string }, // argument
    { rejectValue: string }
>("categories/add", async ({ name }, { rejectWithValue }) => {
    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/categories/add`,
            { name }
        );
        return res.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
            return rejectWithValue(
                err.response.data?.message || "Failed to add category"
            );
        }
        return rejectWithValue("Failed to add category");
    }
});

export const fetchCategories = createAsyncThunk<
    Category[],
    void,
    { rejectValue: string }
>("categories/fetch", async (_, { rejectWithValue }) => {
    try {
        const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/categories/get`
        );
        return res.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
            return rejectWithValue(
                err.response.data?.message || "Failed to fetch categories"
            );
        }
        return rejectWithValue("Failed to fetch categories");
    }
});

const categorySlice = createSlice({
    name: "categories",
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(addCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload); // add new category to existing list
            })
            .addCase(addCategory.rejected, (state, action) => {
                state.error = action.payload || "Error adding category";
            })
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error fetching categories";
            });
    },
});

export default categorySlice.reducer;
