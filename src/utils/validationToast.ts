import { toast } from "sonner";

type ValidationToastId = string | number;

const VALIDATION_TOAST_ID = "word-validation";

export const showValidationInProgress = (): ValidationToastId =>
  toast.loading("Validating words...", { id: VALIDATION_TOAST_ID });

export const showValidationSuccess = (toastId: ValidationToastId, message: string): void => {
  toast.success(message, { id: toastId });
};

export const showValidationError = (toastId: ValidationToastId, message: string): void => {
  toast.error(message, { id: toastId });
};
