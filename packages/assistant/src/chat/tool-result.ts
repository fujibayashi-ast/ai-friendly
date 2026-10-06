export function isFailure(result: unknown): boolean {
  return (
    typeof result === "object" &&
    result !== null &&
    "ok" in result &&
    result.ok === false
  );
}

export function failureMessage(result: unknown): string {
  return typeof result === "object" &&
    result !== null &&
    "message" in result &&
    typeof result.message === "string"
    ? result.message
    : "";
}
