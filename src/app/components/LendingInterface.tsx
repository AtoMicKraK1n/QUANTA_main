import { useState, useEffect, useCallback } from 'react';
import { Program, BN, AnchorProvider, web3 } from '@project-serum/anchor';
import { AnchorWallet, useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import IDL from '../../app/idl/quanta_lending.json';

// Types
type TransactionType = 'lend' | 'borrow' | 'repay';

interface LendingProgram {
  programId: PublicKey;
  program: Program<any>;
}

interface AccountData {
  lender: PublicKey | null;
  borrower: PublicKey | null;
  balance: number | null;
  tokensLent: BN | null;
  tokensBorrowed: BN | null;
  reputationScore: number | null;
}

// Constants
const PROGRAM_ID = new PublicKey('EfdvNWsnXtmHdW95Xju1EspxowpTUCZuakQdVUCN8XTs');

// Utility functions
const lamportsToSol = (lamports: number): number => lamports / LAMPORTS_PER_SOL;
const solToLamports = (sol: number): number => sol * LAMPORTS_PER_SOL;

export default function LendingInterface() {
  const idl: any = IDL;
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [lendingProgram, setLendingProgram] = useState<LendingProgram | null>(null);
  const [accountData, setAccountData] = useState<AccountData>({
    lender: null,
    borrower: null,
    balance: null,
    tokensLent: null,
    tokensBorrowed: null,
    reputationScore: null
  });
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize program
  useEffect(() => {
    const initializeProgram = async () => {
      if (!wallet || !connection) return;

      try {
        setIsLoading(true);
        setError(null);

        const provider = new AnchorProvider(
          connection,
          wallet,
          { preflightCommitment: "processed" }
        );

        const program = new Program(idl, PROGRAM_ID, provider);

        setLendingProgram({ programId: PROGRAM_ID, program });
        console.log('Program initialized successfully');
      } catch (err) {
        console.error('Failed to initialize program:', err);
        setError('Failed to initialize program. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProgram();
  }, [wallet, connection]);

  // Initialize accounts
  const initializeAccounts = useCallback(async () => {
    if (!lendingProgram?.program || !wallet) return;

    try {
      const [lenderPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("lender"), wallet.publicKey.toBuffer()],
        lendingProgram.programId
      );

      const [borrowerPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("borrower"), wallet.publicKey.toBuffer()],
        lendingProgram.programId
      );

      // Check if lender account exists, if not, initialize it
      try {
        await lendingProgram.program.account.lender.fetch(lenderPDA);
        console.log('Lender account already exists');
      } catch (err) {
        console.log('Initializing lender account...');
        await lendingProgram.program.methods.initializeLender()
          .accounts({
            lender: lenderPDA,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        console.log('Lender account initialized successfully');
      }

      // Check if borrower account exists, if not, initialize it
      try {
        await lendingProgram.program.account.borrower.fetch(borrowerPDA);
        console.log('Borrower account already exists');
      } catch (err) {
        console.log('Initializing borrower account...');
        await lendingProgram.program.methods.initializeBorrower()
          .accounts({
            borrower: borrowerPDA,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        console.log('Borrower account initialized successfully');
      }

      return { lenderPDA, borrowerPDA };
    } catch (err) {
      console.error('Error initializing accounts:', err);
      throw new Error('Failed to initialize accounts. Please try again.');
    }
  }, [lendingProgram?.program, wallet]);

  // Fetch account data
  const fetchAccountData = useCallback(async () => {
    if (!lendingProgram?.program || !wallet) return;

    setIsLoading(true);
    setError(null);

    try {
      const { lenderPDA, borrowerPDA }: any = await initializeAccounts();

      const balance = await connection.getBalance(wallet.publicKey);
      const updatedData: AccountData = {
        lender: lenderPDA,
        borrower: borrowerPDA,
        balance: lamportsToSol(balance),
        tokensLent: null,
        tokensBorrowed: null,
        reputationScore: null
      };

      try {
        const lenderAccount: any = await lendingProgram.program.account.lender.fetch(lenderPDA);
        updatedData.tokensLent = lenderAccount.tokensLent as BN;
      } catch (err) {
        console.error('Error fetching lender account:', err);
      }

      try {
        const borrowerAccount: any = await lendingProgram.program.account.borrower.fetch(borrowerPDA);
        updatedData.tokensBorrowed = borrowerAccount.tokensBorrowed as BN;
        updatedData.reputationScore = borrowerAccount.reputationScore as number;
      } catch (err) {
        console.error('Error fetching borrower account:', err);
      }

      setAccountData(updatedData);
    } catch (err) {
      console.error('Error fetching account data:', err);
      setError('Failed to fetch account data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [lendingProgram?.program, wallet, connection, initializeAccounts]);

  useEffect(() => {
    if (lendingProgram?.program && wallet) {
      fetchAccountData();
    }
  }, [lendingProgram?.program, wallet, fetchAccountData]);

  // Handle transactions
  const handleTransaction = async (type: TransactionType) => {
    if (!lendingProgram?.program || !wallet || !amount || !accountData.lender || !accountData.borrower) {
      setError('Unable to process transaction. Please ensure your wallet is connected and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsedAmount = new BN(solToLamports(parseFloat(amount)));
      
      let tx;
      if (type === 'lend') {
        tx = await lendingProgram.program.methods.lend(parsedAmount)
          .accounts({
            lender: accountData.lender,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } else if (type === 'borrow') {
        tx = await lendingProgram.program.methods.borrow(parsedAmount)
          .accounts({
            borrower: accountData.borrower,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } else if (type === 'repay') {
        tx = await lendingProgram.program.methods.repay(parsedAmount)
          .accounts({
            borrower: accountData.borrower,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      }

      console.log(`${type} transaction successful:`, tx);
      await fetchAccountData();
      setAmount('');
    } catch (err) {
      console.error(`Error during ${type}:`, err);
      setError(`Failed to ${type}. Please try again. Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet) {
    return <div className="p-4 text-center">Please connect your wallet</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Account Information</h2>
        <p>
          <strong>Wallet Address:</strong> {wallet.publicKey.toString()}
        </p>
        <p>
          <strong>Balance:</strong> {
            accountData.balance !== null ? 
            `${accountData.balance.toFixed(4)} SOL` : 
            'Loading...'
          }
        </p>
        <p>
          <strong>Tokens Lent:</strong> {
            accountData.tokensLent ?
            `${lamportsToSol(accountData.tokensLent.toNumber()).toFixed(4)} SOL` :
            'N/A'
          }
        </p>
        <p>
          <strong>Tokens Borrowed:</strong> {
            accountData.tokensBorrowed ?
            `${lamportsToSol(accountData.tokensBorrowed.toNumber()).toFixed(4)} SOL` :
            'N/A'
          }
        </p>
        {accountData.reputationScore !== null && (
          <p>
            <strong>Reputation Score:</strong> {accountData.reputationScore}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (SOL)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          {(['lend', 'borrow', 'repay'] as TransactionType[]).map((action) => (
            <button
              key={action}
              onClick={() => handleTransaction(action)}
              disabled={isLoading}
              className={`
                flex-1 text-white font-bold py-2 px-4 rounded 
                focus:outline-none focus:shadow-outline 
                transition duration-150 ease-in-out
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                ${action === 'lend' ? 'bg-blue-500 hover:bg-blue-600' :
                  action === 'borrow' ? 'bg-green-500 hover:bg-green-600' :
                  'bg-yellow-500 hover:bg-yellow-600'}
              `}
            >
              {isLoading ? 'Processing...' : action.charAt(0).toUpperCase() + action.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}