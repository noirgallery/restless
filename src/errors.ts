export class HTTPError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
  }
}

export class HTTPRedirect extends HTTPError {
  constructor(message: string, status: 301 | 302, public dest: string) {
    super(message, status);
  }
}
