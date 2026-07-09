interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<unknown>;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
