import styles from "./unauthorized.module.css";

export default function Unauthorized() {
  return (
    <div className={styles.attorneyPage}>
      <h1>You do not have permission to access this page.</h1>
    </div>
  );
}
