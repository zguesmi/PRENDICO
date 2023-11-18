import 'reflect-metadata';
import { TestingAppChain } from '@proto-kit/sdk';
import { PrivateKey, PublicKey, UInt64 } from 'o1js';
import { Balances } from '../src/balances';
import { Compensation, CompensationProof, CompensationPublicOutput } from '../src/Compensation';
import { log } from '@proto-kit/common';
import { Pickles } from 'o1js/dist/node/snarky';
import { dummyBase64Proof } from 'o1js/dist/node/lib/proof_system';

// log.setLevel('ERROR');

// Public keys of trusted oracles.
const DISASTER_ORACLE_PRIVATE_KEY = 'EKDzXrLyjHVJgsXH6sXx4CJ6cqZqEwst8Vhds9k4H1Fo6AzQBtvH';
const DISASTER_ORACLE_PUBLIC_KEY = 'B62qqLzJcD4R8uSuZXuAyhFRc6BqALqQ7g2LhV8Xe8ZpmDH1JrueqdB';

const PHONE_ORACLE_PRIVATE_KEY =
'EKEWUJzR4RAH6VajUv5Ni9mGs3Sc7gf9Xrp5qctPJh4kZw362kak';
const PHONE_ORACLE_PUBLIC_KEY = 'B62qnHWT9s9YiyzDBvEKKii4ocyjd5sujP9KCojK6BcCoHV6wujDBQo';

describe('Compensation', () => {

    // Declare
    let appChain: TestingAppChain<{
        Balances: typeof Balances;
        Compensation: typeof Compensation;
    }>;
    let compensation: Compensation;
    let balances: Balances;
    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    // const key = Poseidon.hash(alice.toFields());
    
    beforeEach(async () => {
        await startChainAndResolveRuntime();
    });


    it('should setup oracles public keys', async () => {
        const expectedDisasterOraclePublicKey: PublicKey = PublicKey.fromBase58(DISASTER_ORACLE_PUBLIC_KEY)
        const expectedPhoneOraclePublicKey: PublicKey = PublicKey.fromBase58(PHONE_ORACLE_PUBLIC_KEY)
        // Send setup tx.
        const tx = await appChain.transaction(alice, () => {
            compensation.setupPublicKeys(
                expectedDisasterOraclePublicKey,
                expectedPhoneOraclePublicKey,
            );
        });
        await tx.sign();
        await tx.send();
        const block = await appChain.produceBlock();
        // Read state.
        const disasterOraclePublicKey = await appChain.query.runtime.Compensation.disasterOraclePublicKey.get();
        const phoneOraclePublicKey = await appChain.query.runtime.Compensation.phoneOraclePublicKey.get();
        // Check tx status.
        expect(block?.txs[0].status).toBe(true);
        // Check that public keys match.
        expect(disasterOraclePublicKey).toBe(expectedDisasterOraclePublicKey);
        expect(phoneOraclePublicKey).toBe(expectedPhoneOraclePublicKey);
    }, 1_000_000);

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

    async function startChainAndResolveRuntime() {
        appChain = TestingAppChain.fromRuntime({
            modules: {
                Balances,
                Compensation,
            },
            config: {
                Balances: {
                    totalSupply: UInt64.from(10000),
                },
                Compensation: {}
            },
        });
        await appChain.start();
        appChain.setSigner(alicePrivateKey);
        balances = appChain.runtime.resolve('Balances');
        compensation = appChain.runtime.resolve('Compensation');
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
