import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCategories, createCategory, deleteCategory } from '../../services/categoryApi';

const CategoryManagementPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null); // categoryId being deleted

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      // Refetch categories
      const response = await getCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (categoryId) => {
    setDeleting(categoryId);
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
    } catch (err) {
      console.error('Failed to delete category', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="categoryName" className="block mb-2 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="categoryName"
              type="text"
              required
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newCategory.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="categoryDescription" className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="categoryDescription"
              rows="3"
              name="description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newCategory.description}
              onChange={handleChange}
            />
          </div>
          {adding && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          {!adding && (
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-semibold text-lg mb-4">Existing Categories</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <div className="divide-y">
            {(categories || []).map((category) => (
              <div key={category.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    {deleting === category.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagementPage;