import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  const event = "";

  return (
    <div className={styles.container}>
      <Head>
        <title>Astrological Events</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>Welcome to the Astro Events</h1>
        <p className={styles.description}>
          View the atrological events for given month
        </p>
        <div className={styles.chips}>
          <div className={styles.chip}>🌱 Equinox</div>
          <div className={styles.chip}>🌞 Solstice</div>
          <div className={styles.chip}>❤️ Tripura Sundari</div>
          <div className={styles.chip}>🌕 Full moon</div>
          <div className={styles.chip}>🔱 Shivaratri</div>
          <div className={styles.chip}>🌑 New moon</div>
          <div className={styles.chip}>🌒 Moon eclipse</div>
          <div className={styles.chip}>🌚 Solar eclipse</div>
        </div>
        <div className={styles.grid}>
          <a href="" className={styles.card}>
            <h3>&larr; Previous month</h3>
            <p>Get previous months events</p>
          </a>

          <a href="" className={styles.card}>
            <h3>Next month &rarr;</h3>
            <p>Get next months events</p>
          </a>
        </div>
        <div>
          <div className={styles.event}>🌱 Equinox {event}</div>
          <div className={styles.event}>🌞 Solstice: {event}</div>
          <div className={styles.event}>
            ❤️ Tripura Sundari: {event} - peak ({event})
          </div>
          <div className={styles.event}>
            🌕 Full moon: {event} - peak ({event})
          </div>
          <div className={styles.event}>🔱 Shivaratri: {event}</div>
          <div className={styles.event}>🌑 New moon: {event}</div>
          <div className={styles.event}>🌒 Moon eclipse: {event}</div>
          <div className={styles.event}>🌚 Solar eclipse: {event}</div>
        </div>
      </main>

      <footer>
        <div>
          Created by{" "}
          <a href="https://bjrn.nu" target="_blank" rel="noopener noreferrer">
            Björn Wiberg
          </a>
        </div>
      </footer>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer a {
          text-decoration: none;
          color: inherit;
        }
        footer a:hover {
          text-decoration: underline;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
