import { RuntimeModule, state } from "@proto-kit/module";
import { State,assert} from "@proto-kit/protocol";

import { PublicKey, Bool } from "o1js";

export class Admin extends RuntimeModule<unknown> {
  @state() public admin = State.from<PublicKey>(PublicKey);

  public setAdmin(adminPublicKey: PublicKey) {
    const oldAdmin = this.admin.get().orElse(PublicKey.empty());
    assert(oldAdmin.isEmpty(), "Admin key is already set");
    this.admin.set(adminPublicKey);
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
