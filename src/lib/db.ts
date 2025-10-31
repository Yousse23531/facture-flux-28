/**
 * PostgreSQL Database Connection
 * Local database configuration for FacturePro
 */

// Database configuration
export const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'facturepro_db',
  user: import.meta.env.VITE_DB_USER || 'facturepro',
  password: import.meta.env.VITE_DB_PASSWORD || 'facturepro_password_2025',
};

// For browser-based apps, we'll use an API approach
// This file will be used by the backend API

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * Execute a database query
 * Note: This should be called from a backend API, not directly from the browser
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<QueryResult<T>> {
  // This will be implemented in the backend API
  // For now, we'll use fetch to call our API
  const response = await fetch('/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!response.ok) {
    throw new Error('Database query failed');
  }

  return response.json();
}

/**
 * Transaction helper
 */
export async function transaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  // Transaction implementation will be in the backend
  return callback();
}
