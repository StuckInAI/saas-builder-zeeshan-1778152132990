import { AlertTriangle } from 'lucide-react';
import styles from './DeleteConfirmModal.module.css';

type DeleteConfirmModalProps = {
  listingName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
};

export default function DeleteConfirmModal({ listingName, onConfirm, onCancel, deleting }: DeleteConfirmModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <AlertTriangle size={28} />
        </div>
        <h3 className={styles.title}>Delete Listing</h3>
        <p className={styles.message}>
          Are you sure you want to delete <strong>"{ listingName}"</strong>? This action cannot be undone.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
