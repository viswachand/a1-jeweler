import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Item {
    itemSKU: string;
    itemName: string;
    itemDescription: string;
    itemCategory: string;
    costPrice: number;
    unitPrice: number;
    quantity: number;
    style?: string;
    storeCode?: string;
    size?: string;
    vendor?: string;
    eglId?: string;
    location?: string;
    customText1?: string;
    customText3?: string;
    metal?: string;
    department?: string;
    itemCode?: string;
    vendorStyle?: string;
    agsId?: string;
    giaId?: string;
    customText2?: string;
    customFloat?: number;
    sold?: boolean;
    soldDate?: string;
    soldPrice?: number;
    id: string
}

interface ItemState {
    items: Item[];
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: ItemState = {
    items: [],
    loading: false,
    error: null,
    successMessage: null,
};

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/items',
    withCredentials: true,
});

export const createItem = createAsyncThunk<
    Item,
    Item,
    { rejectValue: string }
>('items/createItem', async (newItem, { rejectWithValue }) => {

    try {
        const response = await API.post('/items/itemCreation', newItem);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.response.data?.errors?.[0]?.message || 'Failed to create item');
        }
        return rejectWithValue('Failed to create item');
    }
});

export const fetchItems = createAsyncThunk<Item[], void, { rejectValue: string }>(
    'items/fetchItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/items/items');
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data?.errors?.[0]?.message || 'Failed to fetch items');
            }
            return rejectWithValue('Failed to fetch items');
        }
    }
);

const itemSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        clearItemError: (state) => {
            state.error = null;
        },
        clearItemSuccess: (state) => {
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createItem.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createItem.fulfilled, (state, action: PayloadAction<Item>) => {
                state.loading = false;
                state.items.push(action.payload);
                state.successMessage = 'Item created successfully';
            })
            .addCase(createItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create item';
            })
            .addCase(fetchItems.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch items';
            });
    },
});

export const { clearItemError, clearItemSuccess } = itemSlice.actions;
export default itemSlice.reducer;
