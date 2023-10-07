
import React from 'react'
import { useState } from 'react'
import Image from "next/image"
import KYCModal from '../components/KYCModal'
import styles from '../styles/Home.module.css'
import iconExport from "../images/export.svg"


function Page() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <a
          href={`https://github.com/KnowYourCat/knowyourcat-categoryUI-demo`}
          className={styles.link}
          rel="noopener noreferrer"
          target="_blank"
        >
          Github <Image src={iconExport} alt="icon export" />
        </a>
      </header>

      <main className={styles.main}>

        <div style={{ fontSize: "14px" }}>
          <span>Want to increase your deposit limits?&nbsp;</span>
          <button onClick={() => setShowModal(true)} className={styles.button}>Learn more</button>
        </div>

        {showModal
          ? <div className={styles.modal}>
            <KYCModal
              closeModal={() => setShowModal(false)}
            />
          </div>
          : null}

      </main>

    </div>
  )
}

export default Page
