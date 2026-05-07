import styles from './SupabaseNotice.module.css';
import { AlertTriangle } from 'lucide-react';

export default function SupabaseNotice() {
  return (
    <div className={styles.notice}>
      <AlertTriangle size={18} />
      <span>
        Supabase is not configured. Please set{' '}
        <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> in your environment.
      </span>
    </div>
  );
}
