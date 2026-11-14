import type { Metadata } from "next";
import Link from "next/link";
import styles from "./preview.module.css";

export const metadata: Metadata = {
  title: "Бірге — мобильная версия",
  robots: { index: false, follow: false },
};

export default function MobilePreview() {
  return (
    <main className={styles.preview}>
      <header className={styles.heading}>
        <div>
          <h1>Бірге на телефоне</h1>
          <p>Листайте экран и пользуйтесь приложением внутри телефона.</p>
        </div>
        <Link href="/ru" className={styles.fullscreen}>Открыть без рамки ↗</Link>
      </header>
      <div className={styles.device} aria-label="Просмотр в рамке телефона">
        <div className={styles.screen}>
          <iframe
            title="Мобильное приложение Бірге"
            src="/ru"
            className={styles.app}
          />
        </div>
        <span className={styles.homeIndicator} aria-hidden="true" />
      </div>
    </main>
  );
}
