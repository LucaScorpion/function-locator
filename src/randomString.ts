const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function randomString(): string {
  let result = '';
  for (let i = 0; i < 16; i++) {
    result = `${result}${chars[Math.floor(Math.random() * chars.length)]}`;
  }
  return result;
}
