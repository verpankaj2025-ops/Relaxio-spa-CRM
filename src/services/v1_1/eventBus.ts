import { ModuleFeatureFlags } from '../../types/v1_1';
import { moduleRegistry } from './moduleRegistry';

export type EventCallback<T = unknown> = (data: T) => void | Promise<void>;

export class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  public subscribe<T = unknown>(eventName: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    const eventSet = this.listeners.get(eventName)!;
    eventSet.add(callback as EventCallback);

    return () => {
      eventSet.delete(callback as EventCallback);
    };
  }

  public async publish<T = unknown>(eventName: string, data: T): Promise<void> {
    const eventSet = this.listeners.get(eventName);
    if (!eventSet || eventSet.size === 0) return;

    const promises = Array.from(eventSet).map(cb => Promise.resolve(cb(data)));
    await Promise.allSettled(promises);
  }
}

export const eventBus = new EventBus();

// Feature-gated Plugin Loader Architecture for v1.1
export interface PluginModule {
  id: string;
  name: string;
  version: string;
  requiredFeatureFlag: keyof ModuleFeatureFlags;
  initialize: () => Promise<void>;
}

export class PluginRegistry {
  private plugins: Map<string, PluginModule> = new Map();

  public registerPlugin(plugin: PluginModule): void {
    this.plugins.set(plugin.id, plugin);
  }

  public async initializeActivePlugins(): Promise<void> {
    const pluginList = Array.from(this.plugins.values());
    for (const plugin of pluginList) {
      if (moduleRegistry.isFeatureEnabled(plugin.requiredFeatureFlag)) {
        try {
          await plugin.initialize();
        } catch (err) {
          console.error(`Failed to initialize plugin ${plugin.id}:`, err);
        }
      }
    }
  }
}

export const pluginRegistry = new PluginRegistry();

