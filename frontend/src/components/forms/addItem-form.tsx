import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchCategories } from "@/features/categories/categorySlice";
import { createItem } from "@/features/items/itemSlice";
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
  itemDescription: string;
  itemCategory: string;
  costPrice: number;
  unitPrice: number;
  quantity: number;

  // Optional Fields
  style?: string;
  storeCode?: string;
  size?: string;
  eglId?: string;
  location?: string;
  customText1?: string;
  customText2?: string;
  metal?: string;
  department?: string;
  itemCode?: string;
  vendorStyle?: string;
  agsId?: string;
  giaId?: string;
  customFloat?: string;
}

export default function AddItemForm() {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.categories);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

 
  const onSubmit = (data: ItemFormData) => {
    const payload = {
      ...data,
      customFloat: data.customFloat ? parseFloat(data.customFloat) : undefined,
    };
  
    dispatch(createItem(payload));
    reset();
  };

  const handleClear = () => reset();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-7xl mx-auto border border-gray-300 rounded-md p-6 space-y-4"
    >
      <div className="text-lg font-semibold mb-2">Add New Item</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

        <div className="space-y-4">
          <div className="text-sm font-semibold text-gray-600 border-b pb-1">
            Required Fields
          </div>

          {[
            { label: "Item SKU", id: "itemSKU", required: true },
            { label: "Item Name", id: "itemName", required: true },
            { label: "Description", id: "itemDescription" },
          ].map(({ label, id, required }) => (
            <div key={id} className="flex items-center gap-4">
              <Label htmlFor={id} className="w-20">
                {label}
              </Label>
              <div className="flex-1">
                <Input
                  id={id}
                  {...register(id as keyof ItemFormData, {
                    required: required ? `${label} is required` : false,
                  })}
                />
                {errors[id as keyof ItemFormData] && (
                  <p className="text-red-500 text-sm">
                    {errors[id as keyof ItemFormData]?.message as string}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4">
            <Label htmlFor="itemCategory" className="w-20">
              Category
            </Label>
            <div className="flex-1">
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
                <p className="text-red-500 text-sm">
                  {errors.itemCategory.message}
                </p>
              )}
            </div>
          </div>

          <AddCategoryDialog />

          {[
            { id: "costPrice", label: "Cost Price" },
            { id: "unitPrice", label: "Unit Price" },
            { id: "quantity", label: "Quantity" },
          ].map(({ id, label }) => (
            <div key={id} className="flex items-center gap-4">
              <Label htmlFor={id} className="w-20">
                {label}
              </Label>
              <div className="flex-1">
                <Input
                  id={id}
                  type="number"
                  {...register(id as keyof ItemFormData, {
                    required: `${label} is required`,
                    valueAsNumber: true,
                  })}
                />
                {errors[id as keyof ItemFormData] && (
                  <p className="text-red-500 text-sm">
                    {errors[id as keyof ItemFormData]?.message as string}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button type="submit" className="w-1/2 mr-2">
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-1/2 ml-2"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold text-gray-600 border-b pb-1">
            Optional Fields
          </div>

          {[
            "style",
            "storeCode",
            "size",
            "eglId",
            "location",
            "customText1",
            "customText2",
            "metal",
            "department",
            "itemCode",
            "vendorStyle",
            "agsId",
            "giaId",
            "customFloat",
          ].map((field) => (
            <div key={field} className="flex items-center gap-4">
              <Label htmlFor={field} className="w-24 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </Label>
              <div className="flex-1">
                <Input id={field} {...register(field as keyof ItemFormData)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
