/**
 * A utility function that wraps try-catch logic and returns a tuple containing either
 * the success value or an error object.
 * @param fn The function to execute within try-catch
 * @returns A tuple of [data, error] where only one will be defined
 */
export const tryCatch = async <T>(
  fn: () => Promise<T> | T
): Promise<[T, null] | [null, Error]> => {
  try {
    const data = await fn();
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
};
