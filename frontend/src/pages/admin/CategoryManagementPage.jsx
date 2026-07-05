import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCategories, createCategory, deleteCategory } from '../../services/categoryApi';

const CategoryManagementPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [formError, setFormError] = useState('');

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setCategories([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadCategories();
      setLoading(false);
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    setFormError('');
    try {
      await createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      await loadCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to create category.');
    } finally {
      setAdding(false);
    }
  };

  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (categoryId) => {
    setDeleting(categoryId);
    setDeleteError('');
    try {
      await deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete category.');
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
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <div className="pt-4">
              <button
                  type="submit"
                  disabled={adding}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {adding ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {deleteError && (
              <p role="alert" className="text-red-600 text-sm mb-4">{deleteError}</p>
          )}
          <h2 className="font-semibold text-lg mb-4">Existing Categories</h2>
          {categories.length === 0 ? (
              <p className="text-gray-500">No categories found.</p>
          ) : (
              <div className="divide-y">
                {categories.map((category) => (
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