import styles from "../styles/Errors.module.css";

export default function Errors({ error }) {
  return (
    <div className={styles.information}>
      {error && <div className={styles.error}>Error fetching events</div>}
    </div>
  );
}
