import { RuntimeModule, runtimeModule, state, runtimeMethod } from '@proto-kit/module';
import { State, StateMap, assert } from '@proto-kit/protocol';
import { Bool, PublicKey, UInt64 } from 'o1js';

interface BalancesConfig {
    totalSupply: UInt64;
}

@runtimeModule()
export class Balances extends RuntimeModule<BalancesConfig> {
    @state() public balances = StateMap.from<PublicKey, UInt64>(PublicKey, UInt64);
    @state() public circulatingSupply = State.from<UInt64>(UInt64);

    @runtimeMethod()
    public deposit(address: PublicKey, amount: UInt64): void {
        const circulatingSupply = this.circulatingSupply.get();
        const newCirculatingSupply = circulatingSupply.value.add(amount);
        assert(
            newCirculatingSupply.lessThanOrEqual(this.config.totalSupply),
            'Circulating supply would be higher than total supply'
        );
        this.circulatingSupply.set(newCirculatingSupply);
        const currentBalance = this.balances.get(address);
        const newBalance = currentBalance.value.add(amount);
        this.balances.set(address, newBalance);
    }

    public sendTokens(from: PublicKey, to: PublicKey, amount: UInt64): void {
        assert(amount.greaterThan(UInt64.zero), 'Invalid amount')
        const fromBalance = this.balances.get(from).value;
        assert(fromBalance.greaterThan(UInt64.zero), 'Invalid from balance');
        const toBalance = this.balances.get(to).value;
        assert(amount.lessThanOrEqual(fromBalance), 'Insufficient balance');
        this.balances.set(from, safeSub(fromBalance, amount));
        this.balances.set(to, safeAdd(toBalance, amount));
    }
}

const errors = {
    underflow: "Cannot subtract, the result would underflow",
    overflow: "Cannot add, the result would overflow",
};

function safeSub(
    a: UInt64,
    b: UInt64,
    error: string = errors.underflow
) {
    const fieldSub = a.value.sub(b.value);
    const fieldSubTruncated = fieldSub.rangeCheckHelper(UInt64.NUM_BITS);
    const doesNotUnderflow = fieldSubTruncated.equals(fieldSub);
    assert(doesNotUnderflow, error);
    return new UInt64(fieldSubTruncated);
}

function safeAdd(a: UInt64, b: UInt64, error = errors.overflow) {
    const fieldAdd = a.value.add(b.value);
    const fieldAddTruncated = fieldAdd.rangeCheckHelper(UInt64.NUM_BITS);
    const doesNotOverflow = fieldAddTruncated.equals(fieldAdd);
    assert(doesNotOverflow, error + ' (a=' + a + ',b=' + b + ')');
    return new UInt64(fieldAddTruncated);
}
