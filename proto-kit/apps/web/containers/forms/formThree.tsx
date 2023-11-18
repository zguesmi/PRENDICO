import { Button } from "@mui/material";
import { Client, useClientStore } from "../../lib/stores/client";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";
import { PublicKey } from "o1js";
import { useWalletStore } from "../../lib/stores/wallet";

type FormProps = {
  onNextStep: () => void;
  userId: number;
  wallet: string;
};

function isPendingTransaction(
  transaction: PendingTransaction | UnsignedTransaction | undefined,
): asserts transaction is PendingTransaction {
  if (!(transaction instanceof PendingTransaction))
    throw new Error("Transaction is not a PendingTransaction");
}

export default function FormThree({ onNextStep, userId }: FormProps) {
  const client = useClientStore();
  const wallet = useWalletStore();

  const handleNext = async () => {
    if (!client.client || !wallet.wallet) return;

    const compensation = client.client.runtime.resolve("Compensation");
    console.log("wallet", wallet);
    const sender = PublicKey.fromBase58(wallet.wallet);
    console.log("sender", sender);
    const tx = await client.client.transaction(sender, () => {
      compensation.setupPublicKeys(
        PublicKey.fromBase58(
          "B62qrh9Bq48KUBTg1ifbKx8SHMKVGW8Ktw7qsd3TQvjzdLCyTbWhVes",
        ),
        PublicKey.fromBase58(
          "B62qqf7eHpJ5ZjKFoYoyxknWEVB1Ppi18gmUQpp8Ck6SoTND7HFinaB",
        ),
      );
    });

    await tx.sign();
    await tx.send();

    // isPendingTransaction(tx.transaction);
    // wallet.addPendingTransaction(tx.transaction);

    // //move to the next step
    // // onNextStep();
    console.log("success");
  };

  return (
    <div>
      <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
        Claim Compensation
      </Button>
    </div>
  );
}
