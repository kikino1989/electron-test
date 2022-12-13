export class SQLError extends Error {
  constructor(message = 'there was an error with no response', public code = 0) {
    super(message);
  }
}