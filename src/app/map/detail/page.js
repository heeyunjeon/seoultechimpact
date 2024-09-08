'use client'

import React from "react";
import styles from "./page.module.css"
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from 'next/navigation';

function Detail() {
    const router = useRouter();
    const handleButtonClick = () => {
        router.push(`/map?object=${object}`);

    };

    const object = 'trash'

    return <>
        <div className={styles.headerWrapper}>
            <IoIosArrowBack
                size={30}
                onClick={() => handleButtonClick(object)}
            />
            <header className={styles.title}>Wonji-Dong - Bin 🗑</header>
            <div className={styles.imgWrapper}>
                <img className={styles.image} src="https://upload.wikimedia.org/wikipedia/ko/thumb/8/83/Urbeach-washroom-changeroom-architecture.jpg/400px-Urbeach-washroom-changeroom-architecture.jpg" />
            </div>
            <div className={styles.informationCard}>
                <p>📍 <strong>Location</strong><br /> &nbsp; - 594-10, Wonji-dong, Seocho-gu, Seoul</p><br />
                <p>⏰ <strong>Trash</strong><br /> &nbsp; - Trash: Recyclables ♻️</p>
            </div>
        </div>
    </>;
}

export default Detail;
