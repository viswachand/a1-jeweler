import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchItems } from "@/features/items/itemSlice";
import { Button } from "@/components/ui/button";

export default function ItemTable() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.items); // assumes items are in `items.items`

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
    //   dispatch(deleteItem(id));
    console.log(id)
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-semibold mb-4">Item List</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm text-left border border-gray-300">
          <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-3 py-2 border">SKU</th>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Description</th>
              {/* <th className="px-3 py-2 border">Category</th> */}
              <th className="px-3 py-2 border">Cost Price</th>
              <th className="px-3 py-2 border">Unit Price</th>
              <th className="px-3 py-2 border">Quantity</th>
              <th className="px-3 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2 border">{item.itemSKU}</td>
                <td className="px-3 py-2 border">{item.itemName}</td>
                <td className="px-3 py-2 border">{item.itemDescription}</td>
                {/* <td className="px-3 py-2 border">{item.itemCategory?.name}</td> */}
                <td className="px-3 py-2 border">${item.costPrice.toFixed(2)}</td>
                <td className="px-3 py-2 border">${item.unitPrice.toFixed(2)}</td>
                <td className="px-3 py-2 border">{item.quantity}</td>
                <td className="px-3 py-2 border text-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
