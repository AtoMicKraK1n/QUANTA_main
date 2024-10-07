'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey , LAMPORTS_PER_SOL} from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program, Idl } from '@coral-xyz/anchor';
import idl from '../app/idl/quanta_lending.json';
import KycForm from '../app/components/KycForm';
import LendingInterface from '../app/components/LendingInterface';

// Define your program ID and connection
const programId = new PublicKey('EfdvNWsnXtmHdW95Xju1EspxowpTUCZuakQdVUCN8XTs');
const connection = new Connection('https://api.devnet.solana.com', 'processed');

export default function Home() {
  const wallet = useAnchorWallet();  // Use anchor wallet
  const [program, setProgram] = useState<Program | null>(null);
  const [isKycSubmitted, setIsKycSubmitted] = useState(false);
  const { publicKey, connect } = useWallet();
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [accountInfo, setAccountInfo] = useState<Buffer | null>(null);

  useEffect(() => {
    if (publicKey) {
        setIsWalletConnected(true);
        const getBalanceEvery10Seconds = async () => {
            try {
                const newBalance = await connection.getBalance(publicKey);
                setBalance(newBalance / LAMPORTS_PER_SOL);
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };
        getBalanceEvery10Seconds(); // initial call
        const intervalId = setInterval(getBalanceEvery10Seconds, 10000); // every 10 seconds
        return () => clearInterval(intervalId); // cleanup on unmount
    }
}, [publicKey]);

  // Handle KYC submission
  const handleKycSubmit = () => {
    setIsKycSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">QUANTA</h1>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to our P2P-Lending Platform!</h1>
          <h2>Your Balance is: {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</h2>

          {/* Check if the wallet is connected */}
          {!wallet ? (
            <div className="mb-6">
                     <WalletMultiButton className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out" />
            </div>
          ) : !isKycSubmitted ? (
            <KycForm onSubmit={handleKycSubmit} />
          ) : (
            // Pass the program and wallet to LendingInterface after KYC submission
            <LendingInterface  />
          )}
        </div>
      </div>
    </div>
  );
}