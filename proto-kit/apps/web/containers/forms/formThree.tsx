import { Button } from "@mui/material";
import { useClientStore } from "../../lib/stores/client";
import { Field, PublicKey, Signature } from "o1js";
import { useWalletStore } from "../../lib/stores/wallet";
import {
  CompensationProof,
  CompensationPublicOutput,
  canClaim,
} from "chain/dist/src/Compensation";
// import { Pickles } from "o1js/dist/node/snarky";
// import { dummyBase64Proof } from "o1js/dist/node/lib/proof_system";

type FormProps = {
  onNextStep: () => void;
  userId: number;
  phoneApi: string;
  geolocationApi: string;
};

// async function mockProof(
//   publicOutput: CompensationPublicOutput,
// ): Promise<CompensationProof> {
//   const [, proof] = Pickles.proofOfBase64(await dummyBase64Proof(), 2);
//   return new CompensationProof({
//     proof: proof,
//     maxProofsVerified: 2,
//     publicInput: undefined,
//     publicOutput,
//   });
// }

export default function FormThree({
  onNextStep,
  userId,
  phoneApi,
  geolocationApi,
}: FormProps) {
  const client = useClientStore();
  const wallet = useWalletStore();

  console.log(phoneApi);
  console.log(geolocationApi);

  const setupPublicKeys = async () => {
    if (!client.client || !wallet.wallet) return;
    const compensation = client.client.runtime.resolve("Compensation");
    const sender = PublicKey.fromBase58(wallet.wallet);

    //TODO: Set up public key with external script
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
  };

  const claimCompensation = async () => {
    if (!client.client || !wallet.wallet) return;

    const disasterOracleResponse = {
      disasterId: Field(0),
      userSessionId: Field(0),
      amount: Field(0),
      disasterOracleSignatureSalt: Field(0),
      disasterOracleSignature: Signature.fromBase58("b6"),
    };

    const phoneNumberOracleResponse = {
      phoneNumber: Field(0),
      userSessionId: Field(0),
      phoneOracleSignatureSalt: Field(0),
      phoneOracleSignature: Signature.fromBase58("b765"),
    };

    const compensation = client.client.runtime.resolve("Compensation");
    const phoneOraclePublicKey = compensation.phoneOraclePublicKey.get().value;
    const disasterOraclePublicKey =
      compensation.disasterOraclePublicKey.get().value;

    // const compensationProof = await mockProof(
    //   canClaim(
    //     // keys
    //     disasterOraclePublicKey,
    //     phoneOraclePublicKey,
    //     // disaster
    //     disasterOracleResponse.disasterId,
    //     disasterOracleResponse.userSessionId,
    //     disasterOracleResponse.amount,
    //     disasterOracleResponse.disasterOracleSignatureSalt,
    //     disasterOracleResponse.disasterOracleSignature,
    //     // phone number
    //     phoneNumberOracleResponse.phoneNumber,
    //     phoneNumberOracleResponse.phoneOracleSignatureSalt,
    //     phoneNumberOracleResponse.phoneOracleSignature,
    //     // victim's pubkey
    //     wallet.wallet,
    //     // nullifier,
    //   ),
    // );

    // const sender = PublicKey.fromBase58(wallet.wallet);
    // const tx = await client.client.transaction(sender, () => {
    //   compensation.claim(compensationProof);
    // });
    // await tx.sign();
    // await tx.send();
  };

  const handleNext = async () => {
    if (!client.client || !wallet.wallet) return;
    const compensation = client.client.runtime.resolve("Compensation");
    const sender = PublicKey.fromBase58(wallet.wallet);

    // set up Publics Key
    await setupPublicKeys();
    //claim compensation
    await claimCompensation();

    // move to the next step
    onNextStep();
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
