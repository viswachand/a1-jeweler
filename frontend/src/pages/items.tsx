import React from "react";
import AddItemForm from "@/components/forms/addItem-form";
import ItemTable from "@/components/tables.tsx/itemTabel";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Make sure this path is correct

export default function ItemForm() {
  return (
    <div className="w-full  pt-0 pr-4 pb-4 pl-4">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="new">New Item</TabsTrigger>
          <TabsTrigger value="existing">Existing Item</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <AddItemForm />
        </TabsContent>
        <TabsContent value="existing">
          <ItemTable/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
