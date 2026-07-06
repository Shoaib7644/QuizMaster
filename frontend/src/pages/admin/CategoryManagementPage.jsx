import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../../services/categoryApi';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const inputClass =
    'w-full px-4 py-2.5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';
const labelClass = 'block mb-1.5 text-sm font-medium text-text-primary';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

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
    return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;
  }

  return (
      <div className="max-w-3xl mx-auto p-6">
        <PageHeader title="Category Management" />

        <Card className="mb-6">
          <SectionHeader title="Add New Category" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="categoryName" className={labelClass}>Name</label>
              <input
                  id="categoryName"
                  type="text"
                  required
                  name="name"
                  className={inputClass}
                  value={newCategory.name}
                  onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="categoryDescription" className={labelClass}>Description</label>
              <textarea
                  id="categoryDescription"
                  rows="3"
                  name="description"
                  className={inputClass}
                  value={newCategory.description}
                  onChange={handleChange}
              />
            </div>
            {formError && <p role="alert" className="text-danger text-sm">{formError}</p>}
            <Button type="submit" disabled={adding} className="w-full">
              {adding ? 'Adding...' : 'Add Category'}
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeader title="Existing Categories" />
          {deleteError && (
              <p role="alert" className="text-danger text-sm mb-4">{deleteError}</p>
          )}
          {categories.length === 0 ? (
              <p className="text-text-secondary text-sm">No categories found.</p>
          ) : (
              <div className="divide-y divide-border">
                {categories.map((category) => (
                    <div key={category.id} className="py-4 flex justify-between items-center gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-text-primary">{category.name}</h3>
                        <p className="text-text-secondary text-sm">{category.description}</p>
                      </div>
                      <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleting === category.id}
                      >
                        {deleting === category.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                ))}
              </div>
          )}
        </Card>
      </div>
  );
};

export default CategoryManagementPage;