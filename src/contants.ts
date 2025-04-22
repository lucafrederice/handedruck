export type HANDLE_SUBMIT_FN = (formData: FormData) => Promise<{
  success: boolean;
  message: string;
}>;

export type HANDLE_SUBMIT_FN_RETURN_TYPE = Promise<{
  success: boolean;
  message: string;
}>;
