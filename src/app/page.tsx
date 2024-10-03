'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'


// You may need to adjust this URL based on your Solana network configuration
const connection = new Connection('https://api.devnet-beta.solana.com')

export default function QuantaLendingPlatform() {
  const { publicKey, connect } = useWallet()
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isKycSubmitted, setIsKycSubmitted] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    if (publicKey) {
      setIsWalletConnected(true)
      const getBalanceEvery10Seconds = async () => {
        try {
          const newBalance = await connection.getBalance(publicKey)
          setBalance(newBalance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error('Error fetching balance:', error)
        }
        setTimeout(getBalanceEvery10Seconds, 10000)
      }
      getBalanceEvery10Seconds()
    }
  }, [publicKey])

  const connectWallet = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const submitKyc = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder for KYC submission logic
    console.log("Submitting KYC...")
    setIsKycSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">QUANTA</h1>
          <p className="text-center text-gray-600 mb-6">Connect your wallet and complete KYC to start lending</p>
          {!isWalletConnected ? (
            <button
              onClick={connectWallet}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 mr-2 -mt-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Connect Wallet
            </button>
          ) : !isKycSubmitted ? (
            <>
              {balance !== null && (
                <p className="text-center text-gray-600 mb-4">
                  Balance: {balance.toFixed(4)} SOL
                </p>
              )}
              <form onSubmit={submitKyc} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    id="dob"
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                  <input
                    id="address"
                    type="text"
                    placeholder="9175 **** **** ***3"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 mr-2 -mt-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Submit KYC
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-xl font-semibold text-gray-800">KYC Submitted Successfully!</p>
              <p className="text-gray-600">Your application is under review. We&apos;ll notify you once it&apos;s approved.</p>
            </div>
          )}
        </div>
        <div className="bg-gray-100 px-6 py-4 text-center text-sm text-gray-500">
          Secure • Decentralized • Fast
        </div>
      </div>
    </div>
  )
}