import { BaseDisabledProvider } from "./base.js";

export class VercelProvider extends BaseDisabledProvider {
  readonly id = "vercel";
  readonly name = "Vercel";
}
