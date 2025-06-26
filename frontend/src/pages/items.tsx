// src/features/items/components/ItemForm.tsx
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchCategories } from "@/features/categories/categorySlice";
import { createItem } from "@/features/items/item";
import { AddCategoryDialog } from "@/components/AddCategoryDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemFormData {
  itemSKU: string;
  itemName: string;
  itemDescription?: string;
  itemCategory: string;
  costPrice: number;
  unitPrice: number;
  quantity: number;
}

export default function ItemForm() {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.categories);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ItemFormData>();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const onSubmit = (data: ItemFormData) => {
    console.log(data);
    dispatch(
      createItem({ ...data, itemDescription: data.itemDescription ?? "" })
    );
    reset();
  };

  return (
    <div className="w-full md:w-1/2 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative border border-gray-300 rounded-md p-6"
      >
        <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-gray-600">
          Required Fields
        </div>

        <div className="space-y-2">
          <div>
            <Label htmlFor="itemSKU">Item SKU</Label>
            <Input
              id="itemSKU"
              {...register("itemSKU", { required: "Item SKU is required" })}
              placeholder="Scan barcode"
            />
            {errors.itemSKU && (
              <p className="text-red-500 text-sm">{errors.itemSKU.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              {...register("itemName", { required: "Item Name is required" })}
            />
            {errors.itemName && (
              <p className="text-red-500 text-sm">{errors.itemName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="itemDescription">Description</Label>
            <Input id="itemDescription" {...register("itemDescription")} />
          </div>

          <div>
            <Label htmlFor="itemCategory">Category</Label>
            <Controller
              name="itemCategory"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.itemCategory && (
              <p className="text-sm text-red-500 mt-1">
                {errors.itemCategory.message}
              </p>
            )}
          </div>

          <AddCategoryDialog />

          <div>
            <Label htmlFor="costPrice">Cost Price</Label>
            <Input
              id="costPrice"
              type="number"
              step="1"
              {...register("costPrice", {
                required: "Cost Price is required",
                valueAsNumber: true,
              })}
            />
            {errors.costPrice && (
              <p className="text-red-500 text-sm">{errors.costPrice.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="unitPrice">Unit Price</Label>
            <Input
              id="unitPrice"
              type="number"
              step="1"
              {...register("unitPrice", {
                required: "Unit Price is required",
                valueAsNumber: true,
              })}
            />
            {errors.unitPrice && (
              <p className="text-red-500 text-sm">{errors.unitPrice.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              {...register("quantity", {
                required: "Quantity is required",
                valueAsNumber: true,
              })}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm">{errors.quantity.message}</p>
            )}
          </div>
          <div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
