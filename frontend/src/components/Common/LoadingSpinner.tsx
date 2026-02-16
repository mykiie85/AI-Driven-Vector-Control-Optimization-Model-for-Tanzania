import React from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "default";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "default",
}) => (
  <div className={styles.container} role="status" aria-live="polite">
    <div
      className={`${styles.spinner} ${size === "small" ? styles.spinnerSmall : ""}`}
      aria-hidden="true"
    />
    <span className={styles.message}>{message}</span>
    <span className="sr-only">{message}</span>
  </div>
);

export const SkeletonLoader: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`${styles.skeleton} ${styles.skeletonLine} ${
          i === lines - 1 ? styles.skeletonLineShort : ""
        }`}
      />
    ))}
    <span className="sr-only">Loading content...</span>
  </div>
);

export default LoadingSpinner;
