import { describe, it, expect } from "vitest";
import { parseEnv, envSchema } from "./env";

describe("env", () => {
  const minimalValid = {
    NODE_ENV: "test",
    DATABASE_URL: "file:test.db",
    AUTH_SECRET: "test-secret",
    NEXTAUTH_URL: "http://localhost:3000",
    CRON_SECRET: "test-cron-secret",
    GEMINI_API_KEY: "test-gemini-key",
    GEMINI_MODEL: "gemini-2.5-flash",
  };

  it("parseEnv accepts minimal valid env", () => {
    const result = parseEnv(minimalValid as NodeJS.ProcessEnv);
    expect(result.DATABASE_URL).toBe("file:test.db");
    expect(result.AUTH_SECRET).toBe("test-secret");
    expect(result.GEMINI_API_KEY).toBe("test-gemini-key");
    expect(result.NODE_ENV).toBe("test");
    expect(result.NEXTAUTH_URL).toBe("http://localhost:3000");
  });

  it("parseEnv defaults NODE_ENV to development when missing", () => {
    const withoutNodeEnv = { ...minimalValid };
    delete (withoutNodeEnv as Record<string, string>).NODE_ENV;
    const result = parseEnv(withoutNodeEnv as NodeJS.ProcessEnv);
    expect(result.NODE_ENV).toBe("development");
  });

  it("parseEnv throws in production runtime when GEMINI_API_KEY is missing", () => {
    const prod = {
      NODE_ENV: "production" as const,
      DATABASE_URL: "postgresql://localhost/db",
      AUTH_SECRET: "test-secret-test-secret-test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      ADMIN_EMAIL: "admin@example.com",
    };
    expect(() => parseEnv(prod as NodeJS.ProcessEnv)).toThrow(/GEMINI_API_KEY/);
  });

  it("parseEnv skips prod-only checks during Next production build phase", () => {
    const build = {
      ...minimalValid,
      NODE_ENV: "production" as const,
      NEXT_PHASE: "phase-production-build",
    };
    delete (build as Record<string, string>).GEMINI_API_KEY;
    delete (build as Record<string, string>).ADMIN_EMAIL;
    const result = parseEnv(build as NodeJS.ProcessEnv);
    expect(result.NODE_ENV).toBe("production");
  });

  it("parseEnv throws when DATABASE_URL is empty", () => {
    expect(() =>
      parseEnv({ ...minimalValid, DATABASE_URL: "" } as NodeJS.ProcessEnv)
    ).toThrow(/Invalid environment configuration/);
  });

  it("envSchema rejects invalid NEXTAUTH_URL", () => {
    const r = envSchema.safeParse({
      ...minimalValid,
      NEXTAUTH_URL: "not-a-url",
    });
    expect(r.success).toBe(false);
  });
});
