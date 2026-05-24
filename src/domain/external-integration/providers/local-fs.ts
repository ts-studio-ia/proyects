import { BaseDisabledProvider } from "./base.js";

export class LocalFSProvider extends BaseDisabledProvider {
  readonly id = "local-fs";
  readonly name = "Local Filesystem";
}
