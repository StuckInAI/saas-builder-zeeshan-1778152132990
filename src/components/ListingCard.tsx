import { Pencil, Trash2, Tag, DollarSign, Layers } from 'lucide-react';
import styles from './ListingCard.module.css';
import clsx from 'clsx';
import type { Listing } from '@/types';

type ListingCardProps = {
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
};

export default function ListingCard({ listing, onEdit, onDelete, deleting }: ListingCardProps) {
  const formatPrice = (price: number) =>
    price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{listing.name}</h3>
          <span className={clsx(styles.badge, listing.status === 'active' ? styles.active : styles.inactive)}>
            {listing.status}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.editBtn}
            onClick={() => onEdit(listing)}
            title="Edit listing"
            disabled={deleting}
          >
            <Pencil size={15} />
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(listing.id)}
            title="Delete listing"
            disabled={deleting}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {listing.description && (
        <p className={styles.description}>{listing.description}</p>
      )}

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <DollarSign size={13} />
          {formatPrice(listing.price)}
        </span>
        {listing.category && (
          <span className={styles.metaItem}>
            <Tag size={13} />
            {listing.category}
          </span>
        )}
        <span className={clsx(styles.metaItem, styles.metaDate)}>
          <Layers size={13} />
          {formatDate(listing.created_at)}
        </span>
      </div>
    </div>
  );
}
