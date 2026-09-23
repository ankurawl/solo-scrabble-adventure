import { afterEach, describe, expect, it, vi } from "vitest";
import { isValidWord } from "./scrabbleUtils";

describe("isValidWord", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
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

  it("uses an exact Datamuse match when the primary dictionary is unavailable", async () => {
    const word = "unbundledword";
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Primary dictionary unavailable"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ word, score: 100 }])),
      );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(isValidWord(word)).resolves.toEqual({ isValid: true, actualWord: word });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain("api.datamuse.com/words");
  });

  it("returns after both remote dictionary requests time out", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Request timed out", "AbortError"));
          });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const validation = isValidWord("unbundledword");
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(1_500);

    await expect(validation).resolves.toEqual({ isValid: false, actualWord: "unbundledword" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  }, 1_000);
});
