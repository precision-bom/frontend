import { PartProvider } from "./types";
import { OctopartProvider } from "./octopart";

export type ProviderName = "octopart";

const providers: Record<ProviderName, () => PartProvider> = {
  octopart: () => new OctopartProvider(),
};

/**
 * Get a provider instance by name
 */
export function getProvider(name: ProviderName): PartProvider {
  const factory = providers[name];
  if (!factory) {
    throw new Error(`Unknown provider: ${name}`);
  }
  return factory();
}

/**
 * Get the default provider (octopart)
 */
export function getDefaultProvider(): PartProvider {
  return getProvider("octopart");
}

/**
 * Get all available provider names
 */
export function getAvailableProviders(): ProviderName[] {
  return Object.keys(providers) as ProviderName[];
}

export { OctopartProvider };
export type { PartProvider } from "./types";
