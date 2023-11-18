import 'reflect-metadata';
import { TestingAppChain } from '@proto-kit/sdk';
import { Compensation, CompensationProof, CompensationPublicOutput, canClaim, message } from '../src/Compensation';
import { Field, PrivateKey, Nullifier, MerkleMap, Poseidon, Bool, UInt64, PublicKey } from 'o1js';
import { Balances } from '../src/balances';
import { Pickles } from 'o1js/dist/node/snarky';
import { dummyBase64Proof } from 'o1js/dist/node/lib/proof_system';

// Public keys of trusted oracles.
const DISASTER_ORACLE_PRIVATE_KEY = 'EKEZhdmk9PdHzo8rskB16o1EBeMs6RpQLB1otLoZHsnCEVMwaTsT';
const DISASTER_ORACLE_PUBLIC_KEY = 'B62qm9E2G2cLYEtzB9uEqUuqThPzYcZrkWseHTDMnuUUT7vF16DixJz';

const PHONE_ORACLE_PRIVATE_KEY = 'EKFNBDtpm19utD529fkp22STibDyEQh8HQ9gnKGuevxf2kNm2eZG';
const PHONE_ORACLE_PUBLIC_KEY = 'B62qpJPFCQkgorM4eLVgnYjeZAZugfns6jxENYcbAoetkkY2zLgpire';

describe('Compensation', () => {
    // Declare
    let appChain: TestingAppChain<{
        Compensation: typeof Compensation;
        Balances: typeof Balances;
    }>;
    let compensation: Compensation;
    let balances: Balances;

    const aliceKey = PrivateKey.random();
    const alice = aliceKey.toPublicKey();
    // const key = Poseidon.hash(alice.toFields());

    beforeAll(async () => {
        await startChain();
    });

    it('should setup oracles public keys', async () => {
        const expectedDisasterOraclePublicKey: PublicKey = PublicKey.fromBase58(DISASTER_ORACLE_PUBLIC_KEY)
        const expectedPhoneOraclePublicKey: PublicKey = PublicKey.fromBase58(PHONE_ORACLE_PRIVATE_KEY)
        const tx = await appChain.transaction(alice, () => {
            compensation.setupPublicKeys(
                expectedDisasterOraclePublicKey,
                expectedPhoneOraclePublicKey,
            );
        });
        await tx.sign();
        await tx.send();
        await appChain.produceBlock();
        const disasterOraclePublicKey = await appChain.query.runtime.Compensation.disasterOraclePublicKey.get();
        const phoneOraclePublicKey = await appChain.query.runtime.Compensation.phoneOraclePublicKey.get();
        expect(disasterOraclePublicKey).toBe(expectedDisasterOraclePublicKey);
        expect(phoneOraclePublicKey).toBe(expectedPhoneOraclePublicKey);
    });

    // it('should allow claiming if a valid proof is provided', async () => {
    //     const nullifier = Nullifier.fromJSON(Nullifier.createTestNullifier(message, aliceKey));

    //     const compensationProof = await mockProof(canClaim(witness, nullifier));

    //     const tx = appChain.transaction(alice, () => {
    //         compensation.claim(compensationProof);
    //     });

    //     await tx.sign();
    //     await tx.send();

    //     const block = await appChain.produceBlock();

    //     const storedNullifier = await appChain.query.runtime.Compensation.nullifiers.get(
    //         compensationProof.publicOutput.nullifier
    //     );
    //     const balance = await appChain.query.runtime.Balances.balances.get(alice);

    //     expect(block?.txs[0].status).toBe(true);
    //     expect(storedNullifier?.toBoolean()).toBe(true);
    //     expect(balance?.toBigInt()).toBe(1000n);
    // });

    // it('should not allow claiming if a spent nullifier is used', async () => {
    //     const nullifier = Nullifier.fromJSON(Nullifier.createTestNullifier([Field(0)], aliceKey));

    //     const compensationProof = await mockProof(canClaim(witness, nullifier));

    //     const tx = appChain.transaction(alice, () => {
    //         compensation.claim(compensationProof);
    //     });

    //     await tx.sign();
    //     await tx.send();

    //     const block = await appChain.produceBlock();

    //     const storedNullifier = await appChain.query.runtime.Compensation.nullifiers.get(
    //         compensationProof.publicOutput.nullifier
    //     );
    //     const balance = await appChain.query.runtime.Balances.balances.get(alice);

    //     expect(block?.txs[0].status).toBe(false);
    //     expect(block?.txs[0].statusMessage).toMatch(/Nullifier has already been used/);
    //     expect(storedNullifier?.toBoolean()).toBe(true);
    //     expect(balance?.toBigInt()).toBe(1000n);
    // });

    async function startChain() {
        appChain = TestingAppChain.fromRuntime({
            modules: {
                Compensation: Compensation,
                Balances: Balances,
            },
            config: {
                Compensation: {},
                Balances: {
                    totalSupply: new UInt64(),
                },
            },
        });
        appChain.setSigner(aliceKey);
        await appChain.start();
        compensation = appChain.runtime.resolve('Compensation');
        balances = appChain.runtime.resolve('Balances');
    }

    async function mockProof(publicOutput: CompensationPublicOutput): Promise<CompensationProof> {
        const [, proof] = Pickles.proofOfBase64(await dummyBase64Proof(), 2);
        return new CompensationProof({
            proof: proof,
            maxProofsVerified: 2,
            publicInput: undefined,
            publicOutput,
        });
    }
});
