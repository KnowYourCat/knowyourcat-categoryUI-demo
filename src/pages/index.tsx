
import React from 'react'
import { ConnectKitButton } from 'connectkit'
import { useAccount } from 'wagmi'
import { useState } from 'react'
import Image from "next/image"
import Account from '../components/Account'
import BABTokenWeekGate from '../components/BABTokenWeekGate'
import styles from '../styles/Home.module.css'
import iconExport from "../images/export.svg"


function Page() {
  const [value, setValue] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [showGate, setShowGate] = useState(false)

  const { isConnected } = useAccount()

  const getRenderInputSection = () =>
    <div className={styles.input_box}>
      <input
        className={styles.input}
        placeholder='enter address'
        autoFocus
        value={value}
        onChange={(e) => {
          setValue(e.target.value.trim())
        }}
      ></input>
      <button
        className={styles.button}
        disabled={loading}
        onClick={() => {
          if (value !== address) {
            setLoading(true)
            setAddress(value)
            setShowGate(true)
          }
        }}
      >
        Check
      </button>
    </div>


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

        {/* {getRenderInputSection()} */}

        <BABTokenWeekGate
          checkAddress={address}
          loading={loading}
          setLoading={setLoading} />

      </main>

      {/* <footer className={styles.footer}>
        <ConnectKitButton />
      </footer> */}
    </div>
  )
}

export default Page
