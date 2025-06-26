import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";
  import { useState } from "react";
  import { useAppDispatch, useAppSelector } from "@/app/hooks";
  import { addCategory } from "@/features/categories/categorySlice";
  import { Loader2 } from "lucide-react";
  
  export function AddCategoryDialog() {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
  
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.categories);
  
    const handleAdd = async () => {
      if (!name.trim()) return;
  
      const result = await dispatch(addCategory({ name }));
  
      if (addCategory.fulfilled.match(result)) {
        setName("");
        setOpen(false); // close dialog on success
      }
      // else: error will be shown if you implement UI
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button type="button" className="text-sm text-primary underline mt-1 w-fit">
            + Add new category
          </button>
        </DialogTrigger>
  
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
  
          <div className="space-y-4">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
  
          <DialogFooter className="mt-4">
            <Button onClick={handleAdd} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  