import { ethers } from 'ethers'
import abi from './BattleGame.json'

const contractAddress = "0x8A008D9826C44b19B2d33b3eA0Fe6fbbC6Af6c66"
const contractABI = abi.abi

export function getContract() {
  try {
    const { ethereum } = window
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      return new ethers.Contract(contractAddress, contractABI, signer)
    }
  } catch (error) {
    console.log(error)
  }
}