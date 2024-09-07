'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  const handleButtonClick = (object) => {
    router.push(`/map?object=${object}`);
  };

  return (
    <div className={styles.container}>
      <h1>Choose an object to find</h1>
      <div className={styles.buttonContainer}>
        <button onClick={() => handleButtonClick('trash')}>Trash</button>
        <button onClick={() => handleButtonClick('toilet')}>Toilet</button>
        <button onClick={() => handleButtonClick('ciggy')}>Ciggy</button>
      </div>
    </div>
  );
}
