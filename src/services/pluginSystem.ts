// ============================================================
// Plugin / Extension System
// Dynamic tool registration — external developers can write plugins
// ============================================================
import { toolRegistry, type AgentTool, type PermissionLevel } from './agentTools';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  tools: PluginToolDef[];
  hooks: ('onStartup' | 'onToolCall' | 'onResponse')[];
}

export interface PluginToolDef {
  name: string;
  description: string;
  permission: PermissionLevel;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  execute: (params: Record<string, any>) => any;
  category: string;
}

interface PluginState {
  manifest: PluginManifest;
  enabled: boolean;
  loadedAt: string;
}

const plugins: PluginState[] = [];
const hookHandlers: Record<string, ((...args: any[]) => any)[]> = {
  onStartup: [],
  onToolCall: [],
  onResponse: [],
};

// ============================================================
// Plugin Registration
// ============================================================

export function registerPlugin(manifest: PluginManifest): boolean {
  // Check for duplicate
  if (plugins.find(p => p.manifest.id === manifest.id)) {
    console.warn(`Plugin "${manifest.id}" already registered`);
    return false;
  }

  // Register all tools from the plugin
  for (const toolDef of manifest.tools) {
    const tool: AgentTool = {
      name: `${manifest.id}.${toolDef.name}`,
      description: toolDef.description,
      permission: toolDef.permission,
      parameters: toolDef.parameters,
      execute: toolDef.execute,
      category: toolDef.category as any,
    };
    toolRegistry.push(tool);
  }

  // Register hooks
  for (const hook of manifest.hooks) {
    if (hookHandlers[hook]) {
      hookHandlers[hook].push(() => {
        console.log(`Plugin "${manifest.name}" hook "${hook}" triggered`);
      });
    }
  }

  plugins.push({
    manifest,
    enabled: true,
    loadedAt: new Date().toISOString(),
  });

  // Trigger onStartup
  if (manifest.hooks.includes('onStartup')) {
    console.log(`Plugin "${manifest.name}" startup triggered`);
  }

  return true;
}

export function unregisterPlugin(pluginId: string): boolean {
  const idx = plugins.findIndex(p => p.manifest.id === pluginId);
  if (idx === -1) return false;

  const plugin = plugins[idx];
  // Remove tools
  for (const toolDef of plugin.manifest.tools) {
    const toolIdx = toolRegistry.findIndex(t => t.name === `${pluginId}.${toolDef.name}`);
    if (toolIdx !== -1) toolRegistry.splice(toolIdx, 1);
  }

  plugins.splice(idx, 1);
  return true;
}

export function enablePlugin(pluginId: string): boolean {
  const plugin = plugins.find(p => p.manifest.id === pluginId);
  if (!plugin) return false;
  plugin.enabled = true;
  return true;
}

export function disablePlugin(pluginId: string): boolean {
  const plugin = plugins.find(p => p.manifest.id === pluginId);
  if (!plugin) return false;
  plugin.enabled = false;
  return true;
}

export function getPlugins(): PluginState[] {
  return plugins;
}

export function runHook(hook: string, ...args: any[]): void {
  hookHandlers[hook]?.forEach(handler => handler(...args));
}

// ============================================================
// Built-in Plugin Examples
// ============================================================

export function loadBuiltinPlugins(): void {
  // Example: Slack Notification Plugin
  registerPlugin({
    id: 'notifications',
    name: 'Notification Hub',
    version: '1.0.0',
    author: 'Project Agent',
    description: 'Sends desktop notifications for important events',
    tools: [
      {
        name: 'send_desktop_notification',
        description: 'Send a desktop/system notification',
        permission: 'write',
        parameters: [
          { name: 'title', type: 'string', required: true, description: 'Notification title' },
          { name: 'message', type: 'string', required: true, description: 'Notification message' },
        ],
        execute: (params) => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(params.title, { body: params.message });
            return { sent: true };
          }
          return { sent: false, reason: 'Notifications not permitted' };
        },
        category: 'system',
      },
    ],
    hooks: ['onStartup'],
  });

  // Example: Timer Plugin
  registerPlugin({
    id: 'timer',
    name: 'Task Timer',
    version: '1.0.0',
    author: 'Project Agent',
    description: 'Track time spent on tasks with a Pomodoro timer',
    tools: [
      {
        name: 'start_timer',
        description: 'Start a focused work timer (Pomodoro: 25 min)',
        permission: 'write',
        parameters: [],
        execute: () => {
          const minutes = 25;
          return { started: true, duration: `${minutes} minutes`, endTime: new Date(Date.now() + minutes * 60000).toISOString() };
        },
        category: 'system',
      },
    ],
    hooks: [],
  });

  // Example: Weather Plugin (simulated)
  registerPlugin({
    id: 'weather',
    name: 'Weather Info',
    version: '1.0.0',
    author: 'Project Agent',
    description: 'Get weather information for planning outdoor work',
    tools: [
      {
        name: 'get_weather',
        description: 'Get current weather for a city',
        permission: 'read',
        parameters: [
          { name: 'city', type: 'string', required: true, description: 'City name' },
        ],
        execute: (params) => {
          // Simulated weather data
          const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '🌧️ Rainy', '🌤️ Clear'];
          return {
            city: params.city,
            temperature: Math.round(15 + Math.random() * 20),
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            humidity: Math.round(40 + Math.random() * 40),
          };
        },
        category: 'system',
      },
    ],
    hooks: [],
  });
}

// Load built-in plugins immediately
loadBuiltinPlugins();