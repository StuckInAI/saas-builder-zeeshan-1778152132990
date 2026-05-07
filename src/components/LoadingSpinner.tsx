import styles from './LoadingSpinner.module.css';
import clsx from 'clsx';

type LoadingSpinnerProps = {
  fullscreen?: boolean;
  size?: number;
};

export default function LoadingSpinner({ fullscreen = false, size = 36 }: LoadingSpinnerProps) {
  return (
    <div className={clsx(styles.wrapper, fullscreen && styles.fullscreen)}>
      <div
        className={styles.spinner}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
