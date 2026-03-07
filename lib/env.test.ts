import { describe, it, expect } from "vitest";
import { parseEnv, envSchema } from "./env";

describe("env", () => {
  const minimalValid = {
    NODE_ENV: "test",
    DATABASE_URL: "file:test.db",
    AUTH_SECRET: "test-secret",
    NEXTAUTH_URL: "http://localhost:3000",
    GEMINI_API_KEY: "test-gemini-key",
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

  it("parseEnv throws when required var is missing", () => {
    const missing = { ...minimalValid };
    delete (missing as Record<string, string>).GEMINI_API_KEY;
    expect(() => parseEnv(missing as NodeJS.ProcessEnv)).toThrow(
      /Invalid environment configuration/
    );
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
