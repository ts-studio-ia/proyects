import { GitHubProvider } from "./providers/github.js";
import { LocalFSProvider } from "./providers/local-fs.js";
import { DockerProvider } from "./providers/docker.js";
import { KubernetesProvider } from "./providers/kubernetes.js";
import { VercelProvider } from "./providers/vercel.js";
import { VaultProvider } from "./providers/vault.js";
import { TerraformProvider } from "./providers/terraform.js";
import { TailscaleProvider } from "./providers/tailscale.js";
import { KyvernoProvider } from "./providers/kyverno.js";
import { MilvusProvider } from "./providers/milvus.js";
import { DrizzleProvider } from "./providers/drizzle.js";
import { MCPExternalProvider } from "./providers/mcp.js";
import type { ExternalProvider } from "./types.js";

export const ALL_PROVIDERS: ExternalProvider[] = [
  new GitHubProvider(),
  new LocalFSProvider(),
  new DockerProvider(),
  new KubernetesProvider(),
  new VercelProvider(),
  new VaultProvider(),
  new TerraformProvider(),
  new TailscaleProvider(),
  new KyvernoProvider(),
  new MilvusProvider(),
  new DrizzleProvider(),
  new MCPExternalProvider()
];

export const getProvider = (id: string): ExternalProvider | undefined =>
  ALL_PROVIDERS.find((p) => p.id === id);

export const getEnabledProviders = (): ExternalProvider[] =>
  ALL_PROVIDERS.filter((p) => p.status === "enabled" || p.status === "sandbox");

export const areAllProvidersDisabledByDefault = (): boolean =>
  ALL_PROVIDERS.every((p) => p.status === "disabled");
