export interface SQLiteDatabaseConfig {
  name: string;
  location?: string;
  iosDatabaseLocation?: string;
  androidDatabaseLocation?: string;
  createFromLocation?: number;
  key?: string;
}

export interface DbTransaction {
  executeSql: (sql: string, values?: any[], success?: Function, error?: Function) => void;
}

export interface SQLiteTransaction extends DbTransaction {
  start: () => void;
  addStatement: DbTransaction['executeSql'];
  handleStatementSuccess: (handler: Function, response: any) => void;
  handleStatementFailure: (handler: Function, response: any) => void;
  run: () => void;
  abort: (txFailure: any) => void;
  finish: () => void;
  abortFromQ: (sqlerror: any) => void;
}