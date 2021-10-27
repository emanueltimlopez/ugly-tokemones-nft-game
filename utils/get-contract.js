import { ethers } from 'ethers'
import abi from './BattleGame.json'

const contractAddress = "0x41f10938C84485A32a28dA8B7EC9110d12706CcE"
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