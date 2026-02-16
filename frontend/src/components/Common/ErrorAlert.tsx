import React from "react";
import styles from "./ErrorAlert.module.css";

interface ErrorAlertProps {
  message: string;
  title?: string;
  onRetry?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  title = "Error",
  onRetry,
}) => (
  <div className={styles.alert} role="alert" aria-live="assertive">
    <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
    <div className={styles.content}>
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message}</div>
    </div>
    {onRetry && (
      <button
        className={styles.retryBtn}
        onClick={onRetry}
        aria-label="Retry the failed operation"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorAlert;
