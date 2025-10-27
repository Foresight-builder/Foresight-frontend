declare module 'better-sqlite3' {
  class Database {
    constructor(path: string, options?: any)
    pragma(sql: string): any
    exec(sql: string): void
    prepare(sql: string): {
      run: (...params: any[]) => any
      get: (...params: any[]) => any
      all: (...params: any[]) => any
    }
    close(): void
  }
  export default Database
}