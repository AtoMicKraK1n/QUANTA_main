'use client';

import { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program, Idl } from '@coral-xyz/anchor';
import idl from '../idl/quanta_lending.json';
import KycForm from '../app/components/KycForm';
import LendingInterface from '../app/components/LendingInterface';

// Define your program ID and connection
const programId = new PublicKey('7bFtm6sjKSghBzwgjwtK6d29oVCdoHwB5N6kFSYxcN1r');
const connection = new Connection('https://api.devnet.solana.com', 'processed');

export default function Home() {
  const wallet = useAnchorWallet();  // Use anchor wallet
  const [program, setProgram] = useState<Program | null>(null);
  const [isKycSubmitted, setIsKycSubmitted] = useState(false);

  useEffect(() => {
    if (!wallet) {
      console.log('No wallet detected.');
      return;
    }

    console.log('Wallet connected:', wallet.publicKey?.toString());

    if (!wallet.publicKey) {
      console.error('Wallet PublicKey is missing');
      return;
    }

    try {
      // Initialize the AnchorProvider using the wallet and connection
      const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions()
      );
      console.log('Provider initialized:', provider);

      // Initialize the Program with the provider and set it in state
      const program = new anchor.Program(idl as unknown as Idl, programId, provider);
      setProgram(program);
      console.log('Program initialized:', program);
    } catch (error) {
      console.error('Error initializing program:', error);
    }
  }, [wallet]);

  // Handle KYC submission
  const handleKycSubmit = () => {
    setIsKycSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">QUANTA</h1>

          {/* Check if the wallet is connected */}
          {!wallet ? (
            <div className="mb-6">
              <WalletMultiButton className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out" />
            </div>
          ) : !isKycSubmitted ? (
            <KycForm onSubmit={handleKycSubmit} />
          ) : (
            // Pass the program and wallet to LendingInterface after KYC submission
            <LendingInterface program={program} wallet={wallet} />
          )}
        </div>
      </div>
    </div>
  );
}
