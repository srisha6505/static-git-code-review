import { ManagedKey } from "../types";

const STORAGE_KEY = "secure_key_vault_v1";

// Basic obfuscation to prevent plain text reading in LocalStorage
// Note: Client-side storage is never 100% secure against XSS, but this prevents casual snooping.
const obfuscate = (text: string) => {
  try {
    return btoa(text.split("").reverse().join(""));
  } catch (e) {
    return text;
  }
};

const deobfuscate = (text: string) => {
  try {
    return atob(text).split("").reverse().join("");
  } catch (e) {
    return text;
  }
};

class KeyManagerService {
  private keys: ManagedKey[] = [];
  private envLoaded = false;

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    // 1. Load from LocalStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.keys = parsed.map((k: any) => ({
          ...k,
          token: deobfuscate(k.token),
        }));
      } catch (e) {
        console.error("Failed to load keys", e);
        this.keys = [];
      }
    }
  }

  private saveKeys() {
    const toStore = this.keys.map((k) => ({
      ...k,
      token: obfuscate(k.token),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }

  // Inject Environment Variables as temporary keys (only done once per session load)
  private loadEnvKeys() {
    if (this.envLoaded) return;

    const envGh = process.env.GITHUB_TOKEN || process.env.REACT_APP_GITHUB_TOKEN;
    const envGemini = process.env.API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

    // Helper to add if not exists
    const addEnvKey = (token: string, type: "github" | "gemini") => {
      // Handle comma separated keys in .env
      const tokens = token
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      tokens.forEach((t, i) => {
        // Check if this token is already added by user
        if (!this.keys.some((k) => k.token === t)) {
          this.keys.push({
            id: `env-${type}-${i}`,
            name: `Environment ${type === "github" ? "GitHub" : "Gemini"} Key ${i + 1}`,
            type,
            token: t,
          });
        }
      });
    };

    if (envGh) addEnvKey(envGh, "github");
    if (envGemini) addEnvKey(envGemini, 'gemini');

    this.envLoaded = true;
  }

  public getKeys(): ManagedKey[] {
    this.loadEnvKeys();
    return this.keys;
  }

  public addKey(name: string, type: "github" | "gemini", token: string) {
    this.keys.push({
      id: Date.now().toString(),
      name,
      type,
      token,
    });
    this.saveKeys();
  }

  public removeKey(id: string) {
    this.keys = this.keys.filter((k) => k.id !== id);
    this.saveKeys();
  }

  public markRateLimited(token: string) {
    const keyIndex = this.keys.findIndex((k) => k.token === token);
    if (keyIndex !== -1) {
      // Mark as limited for 1 minute
      this.keys[keyIndex].isRateLimitedUntil = Date.now() + 60000;
      console.warn(`Key ${this.keys[keyIndex].name} marked as rate limited.`);
    }
  }

  public getValidKey(type: "github" | "gemini"): string | null {
    this.loadEnvKeys();

    // Sort: User added keys first, then Env keys
    // Filter out rate limited keys
    const now = Date.now();
    const validKeys = this.keys
      .filter((k) => k.type === type)
      .filter((k) => !k.isRateLimitedUntil || k.isRateLimitedUntil < now);

    if (validKeys.length === 0) return null;

    // Simple rotation: Pick first available.
    // In a more complex app, we might track usage count.
    return validKeys[0].token;
  }
}

export const KeyManager = new KeyManagerService();
