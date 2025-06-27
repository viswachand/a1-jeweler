import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createPolicy,
  fetchPolicies,
  updatePolicy,
} from "@/features/policy/policySlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PolicyForm() {
  const dispatch = useAppDispatch();
  const { policies } = useAppSelector((state) => state.policies);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch policies on mount
  useEffect(() => {
    dispatch(fetchPolicies());
    console.log("useEffect")
  }, [dispatch]);

  // When a policy is selected, populate title and description
  useEffect(() => {
    if (!selectedId || policies.length === 0) return;
  
    const selected = policies.find((p) => p.id === selectedId);
  
    if (selected) {
      setTitle(selected.title);
      setDescription(selected.description);
    }
  }, [selectedId, policies]);

  const handleSelect = (value: string) => {
    setSelectedId(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      if (selectedId) {
        await dispatch(updatePolicy({ id: selectedId, title, description })).unwrap();
      } else {
        await dispatch(createPolicy({ title, description })).unwrap();
      }

      // Refresh policies list
      await dispatch(fetchPolicies());

      // Reset form
      setSelectedId(null);
      setTitle("");
      setDescription("");
      setError(null);
    } catch (err) {
      console.error("Policy error:", err);
      setError(typeof err === "string" ? err : "Something went wrong.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto border border-gray-300 rounded-md p-6 shadow-sm space-y-4"
    >
      {/* Dropdown to Select Existing Title */}
      <div>
        <Label>Select Existing Policy</Label>
        <Select value={selectedId ?? ""} onValueChange={handleSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a policy to update" />
          </SelectTrigger>
          <SelectContent>
            {policies.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title Input */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter policy title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description Input */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter policy description"
          rows={20}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 text-center font-medium">{error}</p>
      )}

      {/* Submit Button */}
      <div>
        <Button type="submit" className="w-full" disabled={!title || !description}>
          {selectedId ? "Update Policy" : "Save Policy"}
        </Button>
      </div>
    </form>
  );
}
