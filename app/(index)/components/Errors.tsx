import styles from "../styles/Errors.module.css";

type ErrorsProps = {
  show: boolean;
};

export default function Errors({ show }: ErrorsProps) {
  if (!show) return null;

  return (
    <div className={styles.information}>
      <div className={styles.error}>Error fetching events</div>
    </div>
  );
}
