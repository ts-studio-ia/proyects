import { BaseDisabledProvider } from "./base.js";

export class DockerProvider extends BaseDisabledProvider {
  readonly id = "docker";
  readonly name = "Docker";
}
