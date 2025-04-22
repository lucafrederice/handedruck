import { useState, useTransition } from "react";
import { z } from "zod";

/**
 * A custom hook for handling server actions with loading state and error handling
 *
 * @template TResponseSchema - The Zod schema for the server function's response
 *
 * @param {(formData: FormData) => Promise<z.infer<TResponseSchema>>} serverFn - The server function to execute
 * @param {z.infer<TResponseSchema>} initialState - The initial state for the response
 * @param {z.ZodType} responseSchema - The Zod schema for validating the server function's response
 *
 * @returns {[boolean, (formData: FormData) => void, z.infer<TResponseSchema>]} A tuple containing:
 *   - isPending: boolean - Whether the server action is currently in progress
 *   - trigger: function - Function to trigger the server action
 *   - response: z.infer<TResponseSchema> - The validated response from the server action
 *
 * @throws {z.ZodError} If the response doesn't match the schema
 *
 * @example
 * ```tsx
 * const [isPending, trigger, response] = useServerAction(
 *   handleSubmit,
 *   { success: false, message: "" },
 *   z.object({ success: z.boolean(), message: z.string() })
 * );
 *
 * const handleSubmit = (formData: FormData) => {
 *   trigger(formData);
 * };
 * ```
 */
export function useServerAction<TResponseSchema extends z.ZodType>(
  serverFn: (formData: FormData) => Promise<z.infer<TResponseSchema>>,
  initialState: z.infer<TResponseSchema>,
  responseSchema: TResponseSchema
): [boolean, (formData: FormData) => void, z.infer<TResponseSchema>] {
  const [res, setRes] = useState<z.infer<TResponseSchema>>(initialState);
  const [isPending, startTransition] = useTransition();

  const trigger = (formData: FormData) => {
    startTransition(async () => {
      try {
        // Execute server function with FormData
        const data = await serverFn(formData);

        // Validate and set the response
        const validatedResponse = responseSchema.parse(data);
        setRes(validatedResponse);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error("Validation error:", err.errors);
        } else {
          console.error("Server function failed", err);
        }
      }
    });
  };

  return [isPending, trigger, res];
}
