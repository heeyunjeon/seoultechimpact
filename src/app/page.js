'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { FaTrashAlt, FaRestroom } from "react-icons/fa";
import { PiCigaretteFill } from "react-icons/pi";
import { MdOutlineAddAPhoto } from "react-icons/md";
import { BsFillTrophyFill } from "react-icons/bs";

export default function Home() {
  const router = useRouter();

  const handleButtonClick = (object) => {
    router.push(`/map?object=${object}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.text}>Touch an icon <br />to find your way to </div>
      <header className={styles.pressStart2pRegular}>
        <span className={styles.blinkingText}>BIN</span>GO
      </header>
      <div className={styles.bingoWrapper}>
        <div className={styles.gridContainer}>
          <div className={styles.gridItem}>        <PiCigaretteFill color="black" size={50} onClick={() => handleButtonClick('ciggy')} /></div>
          <div className={styles.gridItem}>Ciggy</div>
          <div className={styles.gridItem}>Trash</div>
          <div className={styles.gridItem}>Toilet</div>
          <div className={styles.gridItem}>      <FaTrashAlt color="black" size={50} onClick={() => handleButtonClick('trash')} /></div>
          <div className={styles.gridItem}><MdOutlineAddAPhoto size={50} /></div>
          <div className={styles.gridItem}><BsFillTrophyFill size={50} /></div>
          <div className={styles.gridItem}>Bin</div>
          <div className={styles.gridItem}>       <FaRestroom color="black" size={50} onClick={() => handleButtonClick('toilet')} /></div>
        </div>
      </div>

    </div>
  );
}
