import { useEffect, useState } from "react";
import { getContract } from "../../utils/get-contract";
import { transformCharacterData } from "../../utils/transform-character-data";
import { LoadingIndicator } from "../loading-indicator";
import styles from './Character.module.css';

function Character({name, imageURI, index, gameContract, setMintingCharacter}) {
  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        const mintTxn = await gameContract.mintCharacter(characterId);
        await mintTxn.wait();
        setMintingCharacter(false);
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error);
      setMintingCharacter(false);
    }
  };

  return (
    <li className={styles.character} key={name}>
      <div className="character__name">
        <p>{name}</p>
      </div>
      <img src={imageURI} alt={name} />
      <button
        type="button"
        className={styles['character__mint-button']}
        onClick={mintCharacterNFTAction(index)}
      >{`Mint ${name}`}</button>
    </li>
  );
}

export function SelectCharacter({ setCharacter }) {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  useEffect(() => {
    setGameContract(getContract());
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );

        setCharacters(characters);
      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacter(transformCharacterData(characterNFT));
      }
    };

    if (gameContract) {
      getCharacters();

      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }
    return () => {
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    };
  }, [gameContract]);

  return (
    <div>
      <h2>Select Character</h2>
      <ul className={styles.character__container}>
        {characters?.map((character, index) =>
          <Character key={index} index={index} gameContract={gameContract} setMintingCharacter={setMintingCharacter} {...character} />)}
      </ul>
      {mintingCharacter && (
        <>
          <LoadingIndicator />
          <p>Minting the NFT...</p>
        </>
      )}
    </div>
  )
}