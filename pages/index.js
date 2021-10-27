import Head from 'next/head'
import Image from 'next/image'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Account } from '../components/account'
import { getContract } from '../utils/get-contract'
import styles from '../styles/Home.module.css'
import { AlertNetwork } from '../components/alert'
import { useNetwork } from '../hooks/useNetwork'
import { SelectCharacter } from '../components/selectCharacter'
import { Arena } from '../components/arena'
import { transformCharacterData } from '../utils/transform-character-data'
import { LoadingIndicator } from '../components/loading-indicator'

export default function Home() {
  const { account, connect } = useWallet()
  const { correctNetwork } = useNetwork()
  const [ mining, setMining ] = useState(false)
  const [ character, setCharacter ] = useState(null)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      const character = await getContract().checkIfUserHasNFT();
      if (character.name) {
        setCharacter(transformCharacterData(character));
      } else {
        console.log('No character NFT found on wallet!');
      }

      setIsLoading(false);
    };

    if (account && correctNetwork) {
      fetchNFTMetadata();
    }
  }, [account, correctNetwork]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Ugly Tokemones - NFT Game</title>
        <meta name="description" content="Ugly Tokemones - NFT Game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <Account account={account} connect={connect} />
      </header>

      <main className={styles.main}>
        {!correctNetwork && <AlertNetwork />}

        {isLoading && correctNetwork && <LoadingIndicator /> }
        {!isLoading && <>
          {!account && <button onClick={connect}>Connect your wallet to play</button>}

          {account && !character && <SelectCharacter setCharacter={setCharacter}/>}
          {account && character && <Arena setCharacter={setCharacter} character={character}/>}
        </>}
        {mining && <p>Mining...</p>}
      </main>

      <footer className={styles.footer}>
        <p>Made with ❤ from Buenos Aires</p>
        <p><a href='https://app.buildspace.so'>Buildspace</a> Project</p>
        <p>I&apos;m <a href='https://twitter.com/timbislopez'>@timbislopez</a> on Twitter</p>
      </footer>
    </div>
  )
}
