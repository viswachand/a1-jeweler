import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCategories } from '@/features/categories/categorySlice';

export const CategorySelect = ({
  onChange,
  value,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="space-y-2">
      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
        Category
      </label>
      <select
        id="category"
        name="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
      >
        <option value="">Select Category</option>
        {loading && <option>Loading...</option>}
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};
