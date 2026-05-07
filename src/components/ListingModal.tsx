import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ListingModal.module.css';
import type { Listing, ListingFormData } from '@/types';

type ListingModalProps = {
  listing: Listing | null;
  onClose: () => void;
  onSave: (formData: ListingFormData) => Promise<void>;
  saving: boolean;
};

const EMPTY_FORM: ListingFormData = {
  name: '',
  description: '',
  price: '',
  category: '',
  status: 'active',
};

export default function ListingModal({ listing, onClose, onSave, saving }: ListingModalProps) {
  const [form, setForm] = useState<ListingFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ListingFormData>>({});

  useEffect(() => {
    if (listing) {
      setForm({
        name: listing.name,
        description: listing.description,
        price: String(listing.price),
        category: listing.category,
        status: listing.status,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [listing]);

  const validate = (): boolean => {
    const newErrors: Partial<ListingFormData> = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required.';
    if (form.price !== '' && isNaN(Number(form.price))) newErrors.price = 'Price must be a valid number.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ListingFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {listing ? 'Edit Listing' : 'Create Listing'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} type="button" disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Product Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              className={styles.input}
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Premium Consulting Package"
              disabled={saving}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your product or service..."
              rows={3}
              disabled={saving}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="price">Price (USD)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                className={styles.input}
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                disabled={saving}
              />
              {errors.price && <span className={styles.error}>{errors.price}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                className={styles.input}
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Consulting, Design"
                disabled={saving}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className={styles.select}
              value={form.status}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving}
            >
              {saving ? 'Saving...' : listing ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
