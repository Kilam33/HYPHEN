import React, { useState } from 'react';
import { 
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Divider,
  Box,
  Table,
  Sheet,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  Alert,
  CircularProgress,
  Checkbox,
  FormHelperText
} from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';

function CategoryManagementModal({ open, onClose, categories, onCategoryChange, apiUrl }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteAssociatedItems, setDeleteAssociatedItems] = useState(false);

  // Handle opening the edit form
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setNewCategory(false);
  };

  // Handle opening the new category form
  const handleAddNewClick = () => {
    setEditingCategory({
      name: '',
      description: ''
    });
    setNewCategory(true);
  };

  // Handle closing the edit form
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategory(false);
  };

  // Handle saving the category
  const handleSaveCategory = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const categoryData = {
        name: formData.get('name'),
        description: formData.get('description') || ''
      };

      const url = newCategory
        ? `${apiUrl}/categories`
        : `${apiUrl}/categories/${editingCategory.id}`;
      const method = newCategory ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save category');
      }

      await response.json();
      setEditingCategory(null);
      setNewCategory(false);
      onCategoryChange(); // Refresh categories
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening delete confirmation dialog
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
    setDeleteAssociatedItems(false); // Reset checkbox state
  };

  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    setError(null);

    try {
      // Add query parameter if we want to delete associated items
      const deleteItemsParam = deleteAssociatedItems ? '?deleteItems=true' : '';
      const response = await fetch(`${apiUrl}/categories/${categoryToDelete.id}${deleteItemsParam}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete category. ${errorData.message || 'It may be in use by inventory items.'}`);
      }

      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
      onCategoryChange(); // Refresh categories
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle checkbox change for deleting associated items
  const handleDeleteItemsCheckboxChange = (event) => {
    setDeleteAssociatedItems(event.target.checked);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg">
        <ModalClose />
        <Typography level="h4">Manage Categories</Typography>
        <Divider sx={{ my: 2 }} />

        {error && (
          <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Category list or edit form */}
        {editingCategory ? (
          <form onSubmit={handleSaveCategory}>
            <Stack spacing={2}>
              <FormControl required>
                <FormLabel>Category Name</FormLabel>
                <Input
                  name="name"
                  defaultValue={editingCategory.name}
                  placeholder="Enter category name"
                  autoFocus
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  defaultValue={editingCategory.description}
                  minRows={3}
                  placeholder="Category description (optional)"
                />
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" color="neutral" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  {newCategory ? 'Add' : 'Update'} Category
                </Button>
              </Box>
            </Stack>
          </form>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                startDecorator={<AddIcon />}
                onClick={handleAddNewClick}
              >
                Add Category
              </Button>
            </Box>
            <Sheet variant="outlined" sx={{ borderRadius: 'md', overflow: 'auto', maxHeight: '400px' }}>
              <Table stickyHeader hoverRow>
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Name</th>
                    <th style={{ width: '40%' }}>Description</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
                        <Typography level="body-lg">No categories found</Typography>
                        <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                          Add your first category to get started
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <Typography fontWeight="lg">{category.name}</Typography>
                          {category.item_count > 0 && (
                            <Typography level="body-xs" color="neutral">
                              {category.item_count} items
                            </Typography>
                          )}
                        </td>
                        <td>
                          <Typography level="body-sm" noWrap sx={{ maxWidth: 200 }}>
                            {category.description || '-'}
                          </Typography>
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="neutral"
                              onClick={() => handleEditClick(category)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="danger"
                              onClick={() => handleDeleteClick(category)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Sheet>
          </>
        )}

        {/* Delete confirmation dialog */}
        <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <ModalDialog variant="outlined" role="alertdialog">
            <Typography level="h4">Confirm Delete</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography mb={2}>
              Are you sure you want to delete the category "{categoryToDelete?.name}"?
              This action cannot be undone.
            </Typography>
            
            {categoryToDelete?.item_count > 0 && (
              <Alert
                color="warning"
                variant="soft"
                startDecorator={<WarningIcon />}
                sx={{ mb: 2 }}
              >
                <Typography fontWeight="lg">
                  This category is used by {categoryToDelete.item_count} inventory items.
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={deleteAssociatedItems}
                    onChange={handleDeleteItemsCheckboxChange}
                    sx={{ mr: 1 }}
                  />
                  <Typography>
                    Also delete all {categoryToDelete.item_count} inventory items in this category
                  </Typography>
                </Box>
                <FormHelperText sx={{ mt: 1 }}>
                  {deleteAssociatedItems
                    ? "All inventory items in this category will be permanently deleted"
                    : "Category cannot be deleted unless empty or this option is selected"}
                </FormHelperText>
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="plain" color="neutral" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="solid" 
                color="danger" 
                onClick={handleConfirmDelete} 
                loading={loading}
                disabled={categoryToDelete?.item_count > 0 && !deleteAssociatedItems}
              >
                Delete
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </ModalDialog>
    </Modal>
  );
}

export default CategoryManagementModal;