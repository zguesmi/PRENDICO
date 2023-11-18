import 'reflect-metadata';
import { TestingAppChain } from '@proto-kit/sdk';
import { PrivateKey, PublicKey, UInt64 } from 'o1js';
import { Balances } from '../src/balances';
import { Admin } from '../src/admin';
import { Compensation, CompensationProof, CompensationPublicOutput } from '../src/compensation';
import { log } from '@proto-kit/common';
import { Pickles } from 'o1js/dist/node/snarky';
import { dummyBase64Proof } from 'o1js/dist/node/lib/proof_system';
import exp from 'constants';

log.setLevel('ERROR');

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
        Admin: typeof Admin;
    }>;
    let compensation: Compensation;
    let balances: Balances;
    let admin: Admin;
    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();
    // const key = Poseidon.hash(alice.toFields());
    
    beforeEach(async () => {
        await startChainAndResolveRuntime();
    });

    it('should Add an admin to the contract',async ()=> {
        const randomAddress = PrivateKey.random().toPublicKey();
        const tx = await appChain.transaction(alice, () => {
            compensation.setAdmin(randomAddress
            );
        });
        await tx.sign();
        await tx.send();
        const block = await appChain.produceBlock();

        const adminAfter = await appChain.query.runtime.Admin.admin.get();
        expect(block?.txs[0].status).toBe(true);
        expect(adminAfter).toEqual(alice);
    },1_000_000);

    it('should fail in case of calling the admin set up twice ',async ()=> {
        const randomAddress = PrivateKey.random().toPublicKey();
        const tx1 = await appChain.transaction(alice, () => {
            compensation.setAdmin(randomAddress
            );
        });
        await tx1.sign();
        await tx1.send();

        await appChain.produceBlock();

        const tx2 = await appChain.transaction(alice, () => {
            compensation.setAdmin(randomAddress
            );
        });
        await tx2.sign();
        await tx2.send();
        const block2 = await appChain.produceBlock();

        const adminAfter = await appChain.query.runtime.Admin.admin.get();
        expect(block2?.txs[0].status).toBe(false);
        expect(block2?.txs[0].statusMessage).toBe("Admin key is already set");

        expect(adminAfter).toEqual(alice);
    },1_000_000);

    it('should be able to change admin to the contract',async ()=> {
        const randomAddress = PrivateKey.random().toPublicKey();
        const tx = await appChain.transaction(alice, () => {
            compensation.setAdmin(randomAddress
            );
        });
        await tx.sign();
        await tx.send();
        const block = await appChain.produceBlock();

        const adminAfter = await appChain.query.runtime.Admin.admin.get();
        expect(block?.txs[0].status).toBe(true);
        expect(adminAfter).toEqual(alice);

        const tx2 = await appChain.transaction(alice, () => {
            compensation.changeAdmin(randomAddress
            );
        });
        await tx2.sign();
        await tx2.send();
        const block2 = await appChain.produceBlock();

        const newAdmin = await appChain.query.runtime.Admin.admin.get();
        expect(block2?.txs[0].status).toBe(true);
        expect(newAdmin).toEqual(randomAddress);


    },1_000_000);

    it('should fail to change admin to the contract',async ()=> {
        const randomAddress = PrivateKey.random().toPublicKey();
        const tx = await appChain.transaction(alice, () => {
            compensation.setAdmin(randomAddress
            );
        });
        await tx.sign();
        await tx.send();
        const block = await appChain.produceBlock();

        const adminAfter = await appChain.query.runtime.Admin.admin.get();
        expect(block?.txs[0].status).toBe(true);
        expect(adminAfter).toEqual(alice);

        const bobPrivateKey = PrivateKey.random();
        const bob = bobPrivateKey.toPublicKey();
        appChain.setSigner(bobPrivateKey);

        const tx2 = await appChain.transaction(bob, () => {
            compensation.changeAdmin(randomAddress
            );
        });
        await tx2.sign();
        await tx2.send();
        const block2 = await appChain.produceBlock();

        const newAdmin = await appChain.query.runtime.Admin.admin.get();
        expect(block2?.txs[0].status).toBe(false);
        expect(newAdmin).toEqual(alice);
        expect(block2?.txs[0].statusMessage).toBe("You are not the admin");
    },1_000_000);

    it('should setup oracles public keys', async () => {
        const randomAddress = PrivateKey.random().toPublicKey();
        const setupAdminTx = await appChain.transaction(alice, () => {
            compensation.setAdmin(randomAddress
            );
        });
        await setupAdminTx.sign();
        await setupAdminTx.send();
        await appChain.produceBlock();
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
        expect(disasterOraclePublicKey).toEqual(expectedDisasterOraclePublicKey);
        expect(phoneOraclePublicKey).toEqual(expectedPhoneOraclePublicKey);
    }, 1_000_000);

    it('should not setup oracles public keys if no admin setup', async () => {
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
        // Check tx status.
        expect(block?.txs[0].status).toBe(false);
        expect(block?.txs[0].statusMessage).toBe("No admin key set !");
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
                Admin,
            },
            config: {
                Balances: {
                    totalSupply: UInt64.from(10000),
                },
                Compensation: {},
                Admin: {}
            },
        });
        await appChain.start();
        appChain.setSigner(alicePrivateKey);
        balances = appChain.runtime.resolve('Balances');
        compensation = appChain.runtime.resolve('Compensation');
        admin = appChain.runtime.resolve('Admin');
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
