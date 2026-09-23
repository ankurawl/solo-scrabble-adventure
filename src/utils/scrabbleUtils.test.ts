import { afterEach, describe, expect, it, vi } from "vitest";
import { isValidWord } from "./scrabbleUtils";

describe("isValidWord", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("falls back to the local dictionary when the remote dictionary does not respond", async () => {
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

    const validation = isValidWord("cat");

    await vi.advanceTimersByTimeAsync(3_000);

    await expect(validation).resolves.toEqual({ isValid: true, actualWord: "cat" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  }, 1_000);
});
