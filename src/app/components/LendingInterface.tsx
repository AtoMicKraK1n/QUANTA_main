import { useState, useEffect } from 'react'
import { Program } from '@coral-xyz/anchor'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'


interface LendingInterfaceProps {
  program: Program | null
  wallet: AnchorWallet
}

export default function LendingInterface({ program, wallet }: LendingInterfaceProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [lenderAccount, setLenderAccount] = useState<any>(null)
  const [borrowerAccount, setBorrowerAccount] = useState<any>(null)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (program && wallet) {
      fetchAccounts()
    }
  }, [program, wallet])

  const fetchAccounts = async () => {
    if (!program || !wallet) return

    try {
      const balance = await program.provider.connection.getBalance(wallet.publicKey)
      setBalance(balance / 1e9)

      const lender = await program.account.lender.fetch(wallet.publicKey)
      
      setLenderAccount(lender)
    } catch (error) {
      console.error('Error fetching lender account:', error)
    }

    try {
      const borrower = await program.account.borrower.fetch(wallet.publicKey)
      setBorrowerAccount(borrower)
    } catch (error) {
      console.error('Error fetching borrower account:', error)
    }
  }

  const handleLend = async () => {
    if (!program || !wallet) return

    try {
      const tx = await program.methods
        .lend(new anchor.BN(parseFloat(amount) * 1e9))
        .accounts({
          lender: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
      
      console.log('Lend transaction:', tx)
      await fetchAccounts()
      setAmount('')
    } catch (error) {
      console.error('Error lending:', error)
    }
  }

  const handleBorrow = async () => {
    if (!program || !wallet) return

    try {
      const tx = await program.methods
        .borrow(new anchor.BN(parseFloat(amount) * 1e9))
        .accounts({
          borrower: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
      
      console.log('Borrow transaction:', tx)
      await fetchAccounts()
      setAmount('')
    } catch (error) {
      console.error('Error borrowing:', error)
    }
  }

  const handleRepay = async () => {
    if (!program || !wallet) return

    try {
      const tx = await program.methods
        .repay(new anchor.BN(parseFloat(amount) * 1e9))
        .accounts({
          borrower: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
      
      console.log('Repay transaction:', tx)
      await fetchAccounts()
      setAmount('')
    } catch (error) {
      console.error('Error repaying:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Account Information</h2>
        <p><strong>Wallet Address:</strong> {wallet.publicKey.toString()}</p>
        <p><strong>Balance:</strong> {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
        <p><strong>Tokens Lent:</strong> {lenderAccount ? `${(lenderAccount.tokensLent / 1e9).toFixed(4)} SOL` : 'N/A'}</p>
        <p><strong>Tokens Borrowed:</strong> {borrowerAccount ? `${(borrowerAccount.tokensBorrowed / 1e9).toFixed(4)} SOL` : 'N/A'}</p>
        {borrowerAccount && <p><strong>Reputation Score:</strong> {borrowerAccount.reputationScore}</p>}
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (SOL)</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleLend}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Lend
          </button>
          <button
            onClick={handleBorrow}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Borrow
          </button>
          <button
            onClick={handleRepay}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Repay
          </button>
        </div>
      </div>
    </div>
  )
}