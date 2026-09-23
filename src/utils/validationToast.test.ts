import { beforeEach, describe, expect, it, vi } from "vitest";

const { loading, success, error } = vi.hoisted(() => ({
  loading: vi.fn(() => "validation-toast"),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { loading, success, error },
}));

import {
  showValidationError,
  showValidationInProgress,
  showValidationSuccess,
} from "./validationToast";

describe("validation toast lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("replaces the loading toast with a success toast using the same id", () => {
    const toastId = showValidationInProgress();
    showValidationSuccess(toastId, "Played: CAT for 5 points!");

    expect(loading).toHaveBeenCalledWith("Validating words...", { id: "word-validation" });
    expect(success).toHaveBeenCalledWith("Played: CAT for 5 points!", { id: toastId });
  });

  it("replaces the loading toast with an error toast using the same id", () => {
    const toastId = showValidationInProgress();
    showValidationError(toastId, "Invalid word: CAAT");

    expect(error).toHaveBeenCalledWith("Invalid word: CAAT", { id: toastId });
  });
});
