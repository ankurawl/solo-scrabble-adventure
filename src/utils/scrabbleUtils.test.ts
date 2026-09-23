import { afterEach, describe, expect, it, vi } from "vitest";
import { isValidWord } from "./scrabbleUtils";

describe("isValidWord", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validates a bundled wordlist-js word without a network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(isValidWord("abacus")).resolves.toEqual({
      isValid: true,
      actualWord: "abacus",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a word absent from the bundled list without consulting a remote API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(isValidWord("tn")).resolves.toEqual({
      isValid: false,
      actualWord: "tn",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
