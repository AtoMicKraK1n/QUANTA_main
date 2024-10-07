import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { promises as fs } from "fs";
import path from "path";

// Path to the keypair file for the program deployer
const DEPLOYER_KEYPAIR_PATH = "quanta-lending/target/deploy/quanta_lending-keypair.json";
const PROGRAM_SO_PATH = "/home/krak1n/QUANTA_main/quanta-lending/target/deploy/quanta_lending.so";  // Path to your .so file
const DEVNET_RPC_URL = "https://api.devnet.solana.com";

async function main() {
    // Load the keypair for the deployer
    const deployerKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(await fs.readFile(DEPLOYER_KEYPAIR_PATH, "utf-8")))
    );

    // Create a connection to Solana Devnet
    const connection = new Connection(DEVNET_RPC_URL, "confirmed");

    // Load the program binary
    const programBinary = await fs.readFile(PROGRAM_SO_PATH);

    // Create a provider using the deployer keypair
    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(deployerKeypair), {
        preflightCommitment: "recent",
    });
    anchor.setProvider(provider);

    // Generate a new keypair for the program
    const programKeypair = Keypair.generate();

    // Deploy the program
    const tx = new anchor.web3.Transaction().add(
        // Add transaction instructions here
    );
    
    const txSignature = await provider.connection.requestAirdrop(
        deployerKeypair.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL // Airdrop SOL to deployer
    );
    // Ensure txSignature is awaited
await provider.connection.confirmTransaction(txSignature);

// Await BPF Loader to load the program
const loadResult = await anchor.web3.BpfLoader.load(
    provider.connection,
    deployerKeypair,
    programKeypair,
    programBinary,
    anchor.web3.BPF_LOADER_PROGRAM_ID
);

if (loadResult) {
    console.log("Program deployed successfully");

    // Now you need to initiate the transaction signature first, let's say it's coming from some previous transaction
    const txSignature = await provider.sendAndConfirm(tx, [deployerKeypair]);
    

    // Confirm the transaction
    await provider.connection.confirmTransaction(txSignature);
    console.log("Transaction confirmed:", txSignature);
} else {
    console.error("Program deployment failed");
}
}