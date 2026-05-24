import { BaseDisabledProvider } from "./base.js";
import type { SecretVaultReference } from "../types.js";

export class VaultProvider extends BaseDisabledProvider {
  readonly id = "hashicorp-vault";
  readonly name = "HashiCorp Vault";

  resolveSecretReference(ref: SecretVaultReference): { resolved: false; reason: string } {
    if (this.status === "disabled") {
      return { resolved: false, reason: "Vault is disabled — enable with explicit governance permit" };
    }
    if (ref.provider !== "hashicorp-vault") {
      return { resolved: false, reason: `provider mismatch: expected hashicorp-vault, got ${ref.provider}` };
    }
    return { resolved: false, reason: "Vault not connected — sandbox mode only" };
  }

  redactSecretOutput(output: string): string {
    return output.replace(/(?:password|secret|token|key)=[^\s&]*/gi, "$1=[REDACTED]");
  }
}
