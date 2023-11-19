import { UInt64 } from 'o1js';
import { Balances } from './balances';
import { Compensation } from './compensation';

export default {
    modules: {
        Balances,
        Compensation,
    },
    config: {
        Balances: {
            totalSupply: UInt64.from(10000),
        },
        Compensation: {},
    },
};
