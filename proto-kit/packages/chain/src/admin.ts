import { RuntimeModule, state } from "@proto-kit/module";
import { State,assert} from "@proto-kit/protocol";

import { PublicKey, Bool } from "o1js";

export class Admin extends RuntimeModule<unknown> {
  @state() public admin = State.from<PublicKey>(PublicKey);

  public setAdmin() {
    const admin = this.admin.get().value;
    const isEmpyt = admin.isEmpty()
    assert(isEmpyt,"Admin key is already set");
    this.admin.set(this.transaction.sender);
  }

  public OnlyAdmin() {
    const admin = this.admin.get().value;
    const isEmpty = admin.isEmpty().toBoolean();
    assert(Bool(!isEmpty),"No admin key set !");
    const isOwner = this.transaction.sender.equals(admin).toBoolean();
    assert(Bool(isOwner),"You are not the admin")
  } 

  public changeAdmin(newAdmin: PublicKey) {
    this.OnlyAdmin();
    this.admin.set(newAdmin);
  }
}
