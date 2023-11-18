import 'reflect-metadata';
import { TestingAppChain } from '@proto-kit/sdk';
import { PrivateKey, PublicKey, UInt64 } from 'o1js';
import { Balances } from '../src/balances';
import { Compensation } from '../src/Compensation';
import { log } from '@proto-kit/common';

// log.setLevel('ERROR');

// Public keys of trusted oracles.
const DISASTER_ORACLE_PRIVATE_KEY = 'EKEZhdmk9PdHzo8rskB16o1EBeMs6RpQLB1otLoZHsnCEVMwaTsT';
const DISASTER_ORACLE_PUBLIC_KEY = 'B62qm9E2G2cLYEtzB9uEqUuqThPzYcZrkWseHTDMnuUUT7vF16DixJz';

const PHONE_ORACLE_PRIVATE_KEY =
'EKFNBDtpm19utD529fkp22STibDyEQh8HQ9gnKGuevxf2kNm2eZG';
const PHONE_ORACLE_PUBLIC_KEY = 'B62qpJPFCQkgorM4eLVgnYjeZAZugfns6jxENYcbAoetkkY2zLgpire';

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
        const expectedPhoneOraclePublicKey: PublicKey = PublicKey.fromBase58(PHONE_ORACLE_PRIVATE_KEY)
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
});
