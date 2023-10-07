import '../styles/globals.css';
import { ConnectKitProvider } from 'connectkit'
import type { AppProps } from 'next/app'
import NextHead from 'next/head'
import * as React from 'react'
import { WagmiConfig } from 'wagmi'
import { client } from '../wagmi'

function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider
        customTheme={{
          "--ck-accent-color": "#ffffff",
          "--ck-accent-text-color": "#ffffff",
        }}
      >
        <NextHead>
          <title>KNOWYOURCAT</title>
          <meta name="title" content="KnowYourCat ID | multichain NFT aggregator for you digital reputation"></meta>
          <meta
            content="Mutatable KnowYourCat SBT store verification, reputation, and other credentials that you have completed on web3 platforms."
            name="description"
          />
        </NextHead>

        {mounted && <Component {...pageProps} />}
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

export default App
