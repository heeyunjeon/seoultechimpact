'use client'

import React from "react";
import styles from "./page.module.css"
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from 'next/navigation';

function detail() {
    const router = useRouter();
    const handleButtonClick = () => {
        router.push(`/map?object=${object}`);

    };

    const object = 'toilet'

    return <>
        <div className={styles.headerWrapper}>
            <IoIosArrowBack
                size={30}
                onClick={() => handleButtonClick(object)}
            />
            <header className={styles.title}>숭인공공화장실</header>
            <div className={styles.imgWrapper}>
                <img className={styles.image} src="https://upload.wikimedia.org/wikipedia/ko/thumb/8/83/Urbeach-washroom-changeroom-architecture.jpg/400px-Urbeach-washroom-changeroom-architecture.jpg" />
            </div>
            <div className={styles.informationCard}>
                <p>📍 <strong>Location</strong><br /> &nbsp; - 서울시 종로구 숭인동</p><br />
                <p>⏰ <strong>Available Time</strong><br /> &nbsp; - 06:00 - 24:00</p>
            </div>
        </div>
    </>;
}

export default detail;
