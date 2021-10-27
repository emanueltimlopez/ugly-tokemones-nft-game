import { useEffect, useState } from "react";
import { transformCharacterData } from "../../utils/transform-character-data";
import { getContract } from "../../utils/get-contract";
import styles from "./Arena.module.css";
import { LoadingIndicator } from "../loading-indicator";

export function Arena({ character, setCharacter }) {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setGameContract(getContract());
  }, []);

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBoss();
      console.log('Boss:', bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };

    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      setBoss((prevState) => {
          return { ...prevState, hp: bossHp };
      });

      setCharacter((prevState) => {
          return { ...prevState, hp: playerHp };
      });
    };

    if (gameContract) {
      fetchBoss();
      gameContract.on('AttackComplete', onAttackComplete);
    }

    return () => {
      if (gameContract) {
          gameContract.off('AttackComplete', onAttackComplete);
      }
    }
  }, [gameContract]);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking boss...');
        const txn = await gameContract.attackBoss();
        await txn.wait();
        console.log(txn);
        setAttackState('hit');

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };

  return (
    <div className={styles.arena__container}>
      <h2>Arena</h2>

      <div className={styles.arena__players}>
        {boss && (
          <div className={styles.boss__container}>
            <div>
              <h2>🔥 {boss.name} 🔥</h2>
              <div>
                <img className={styles.players__images} src={boss.imageURI} alt={`Boss ${boss.name}`} />
                <div>
                  <progress className={styles.players__progress} value={boss.hp} max={boss.maxHp} />
                  <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {character && (
          <div className={styles.player__container}>
            <div>
              <div>
                <h2>{character.name} (You)</h2>
                <img
                  className={styles.players__images}
                  src={character.imageURI}
                  alt={`Character ${character.name}`}
                />
                <div>
                  <progress className={styles.players__progress}  value={character.hp} max={character.maxHp} />
                  <p>{`${character.hp} / ${character.maxHp} HP`}</p>
                </div>
              </div>
              <div>
                <h4>{`⚔️ Attack Damage: ${character.attackDamage}`}</h4>
                {boss && <button onClick={runAttackAction}>
                  {`💥 Attack ${boss.name}`}
                </button>}
              </div>
              {attackState === 'attacking' && (
                <div>
                  <LoadingIndicator />
                  <p>Attacking ⚔️</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}