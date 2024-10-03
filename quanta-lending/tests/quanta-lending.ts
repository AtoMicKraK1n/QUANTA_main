import * as anchor from "@coral-xyz/anchor";


const assert = require("assert");
const localanchor = require("@coral-xyz/anchor");

describe("quanta-lending", () => {
  const provider = localanchor.Provider.local();
  anchor.setProvider(provider);

  const program = localanchor.workspace.QuantaLending;

  it("Can lend tokens", async () => {
    const lender = localanchor.web3.Keypair.generate();

    // Call lend function
    await program.rpc.lend(new localanchor.BN(100), {
      accounts: {
        lender: lender.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    // Check lender's account
    const lenderAccount = await program.account.lender.fetch(lender.publicKey);
    assert.equal(lenderAccount.tokensLent.toString(), "100");
  });
});
