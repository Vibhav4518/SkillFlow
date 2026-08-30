export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${JSON.stringify(x)}`);
}
