export function getErrorMessage(error: unknown, fallback = 'Loi he thong'): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}
