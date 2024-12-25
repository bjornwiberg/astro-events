import styles from "../styles/FetchInformation.module.css";

export function FetchInformation({
  currentDate,
  error,
  loading,
}: {
  currentDate: string;
  error: boolean;
  loading: Boolean;
}) {
  return (
    <div className={styles.information}>
      {loading && `Fetching events for ${currentDate} ...`}
      {error && <div className={styles.error}>Error fetching events</div>}
    </div>
  );
}
