import styles from "../styles/FetchInformation.module.css";

export function FetchInformation({
  currentDate,
  error,
  isReady,
  loading,
}: {
  currentDate: string;
  error: boolean;
  isReady: boolean;
  loading: Boolean;
}) {
  return (
    <div className={styles.information}>
      {!isReady || (loading && `Fetching events for ${currentDate} ...`)}
      {isReady && error && (
        <div className={styles.error}>Error fetching events</div>
      )}
    </div>
  );
}
