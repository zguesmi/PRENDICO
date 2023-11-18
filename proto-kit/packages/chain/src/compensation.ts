import { RuntimeModule, runtimeMethod, state, runtimeModule } from '@proto-kit/module';
import { State, StateMap, assert } from '@proto-kit/protocol';
import {
    Bool,
    Experimental,
    Field,
    Nullifier,
    PublicKey,
    Signature,
    Struct,
    UInt64,
} from 'o1js';
import { inject } from 'tsyringe';
import { Balances } from './balances';
import { Admin } from './admin';

export const ADMIN_INITIAL_BALANCE = 1000n;

export class CompensationPublicOutput extends Struct({
    disasterOraclePublicKey: PublicKey,
    phoneOraclePublicKey: PublicKey,
    amount: Field,
    beneficiary: PublicKey,
    // nullifier: Field, //TODO: Rename?
}) {}

// TODO: Use unique message to prevent nullifier reuse
// hash(disasterId+phoneNumber)
export const message: Field[] = [Field(0)];

export function canClaim(
    // keys
    disasterOraclePublicKey: PublicKey,
    phoneOraclePublicKey: PublicKey,
    // disaster
    disasterId: Field,
    userSessionId: Field,
    amount: Field,
    disasterOracleSignatureSalt: Field,
    disasterOracleSignature: Signature,
    // phone number
    phoneNumber: Field,
    phoneOracleSignatureSalt: Field,
    phoneOracleSignature: Signature,
    // victim's pubkey
    beneficiary: PublicKey,
    // nullifier: Nullifier,
): CompensationPublicOutput {
    // Verify disaster oracle authorization.
    const isValidDisasterAuth = disasterOracleSignature.verify(disasterOraclePublicKey, [
        disasterId,
        userSessionId,
        amount,
        disasterOracleSignatureSalt,
    ]);
    isValidDisasterAuth.assertTrue('Invalid disaster oracle authorization');

    // Verify phone oracle authorization.
    const isValidPhoneAuth = phoneOracleSignature.verify(phoneOraclePublicKey, [
        userSessionId,
        phoneNumber,
        phoneOracleSignatureSalt,
    ]);
    isValidPhoneAuth.assertTrue('Invalid phone oracle authorization');

    // nullifier.verify(message);

    return new CompensationPublicOutput({
        disasterOraclePublicKey,
        phoneOraclePublicKey,
        amount,
        beneficiary,
        // nullifier: nullifier.key(),
    });
}

export const compensationZkProgram = Experimental.ZkProgram({
    publicOutput: CompensationPublicOutput,
    methods: {
        canClaim: {
            privateInputs: [
                PublicKey, // disasterOraclePublicKey
                PublicKey, // phoneOraclePublicKey
                Field, // disasterId
                Field, // userSessionId
                Field, // amount
                Field, // disasterOracleSignatureSalt
                Signature, // disasterOracleSignature
                Field, // phoneNumber
                Field, // phoneOracleSignatureSalt
                Signature, // phoneOracleSignature
                PublicKey, // beneficiary
                // Nullifier, // hash(disasterId, phoneNumber) ??
            ],
            method: canClaim,
        },
    },
});

export class CompensationProof extends Experimental.ZkProgram.Proof(compensationZkProgram) {}

type CompensationConfig = Record<string, never>;

@runtimeModule()
export class Compensation extends RuntimeModule<CompensationConfig> {
    @state() public disasterOraclePublicKey = State.from<PublicKey>(PublicKey);
    @state() public phoneOraclePublicKey = State.from<PublicKey>(PublicKey);
    @state() public nullifiers = StateMap.from<Field, Bool>(Field, Bool);

    public constructor(
        @inject('Balances') public balancesContract: Balances,
        @inject('Admin') public adminContract: Admin,
    ) {
        super();
    }

    @runtimeMethod()
    // add random input to prevent error
    public setAdmin(adminPublicKey : PublicKey) {
        this.adminContract.setAdmin(adminPublicKey);
        this.balancesContract.deposit(this.adminContract.admin.get().value, UInt64.from(ADMIN_INITIAL_BALANCE));
    }

    @runtimeMethod()
    // add random input to prevent error
    public changeAdmin(newAdmin : PublicKey) {
        this.adminContract.changeAdmin(newAdmin);
        // TODO change balance of new admin.
    }

    @runtimeMethod()
    public setupPublicKeys(disasterOraclePublicKey: PublicKey, phoneOraclePublicKey: PublicKey) {
        this.adminContract.OnlyAdmin()
        this.disasterOraclePublicKey.set(disasterOraclePublicKey);
        this.phoneOraclePublicKey.set(phoneOraclePublicKey);
    }

    @runtimeMethod()
    public claim(compensationProof: CompensationProof) {
        compensationProof.verify();

        console.log(this.disasterOraclePublicKey.get().value.toBase58());
        console.log(compensationProof.publicOutput.disasterOraclePublicKey.toBase58());

        Bool(this.disasterOraclePublicKey.get().value.equals(compensationProof.publicOutput.disasterOraclePublicKey))
            .assertTrue('publicOutput: ' + compensationProof.publicOutput.disasterOraclePublicKey.toBase58());
        // assert(
        //     Bool(compensationProof.publicOutput.phoneOraclePublicKey == this.phoneOraclePublicKey.get().value),
        //     'Unknown phoneOraclePublicKey from proof'
        // );
        // // TODO activate nullifier.
        // // const isNullifierUsed = this.nullifiers.get(compensationProof.publicOutput.nullifier);
        // // assert(isNullifierUsed.value.not(), 'Nullifier has already been used');
        // // this.nullifiers.set(compensationProof.publicOutput.nullifier, Bool(true));

        // const from: PublicKey = this.adminContract.admin.get().value;
        // const to: PublicKey = compensationProof.publicOutput.beneficiary;
        // const amount: UInt64 = UInt64.from(3);
        // // this.balancesContract.sendTokens(from, to, amount);
    }
}
