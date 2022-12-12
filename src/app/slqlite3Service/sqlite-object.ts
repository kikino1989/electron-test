import { SQLitePlugin } from "./sqlite-plugin";
import { DbTransaction, SQLiteTransaction } from "./sqlite-types";

export class SQLiteObject {
  databaseFeatures: {
    isSQLitePluginDatabase: boolean;
  };

  constructor(private _objectInstance: SQLitePlugin) {
    this.databaseFeatures = { isSQLitePluginDatabase: true };

  }
  
  get openDBs(): {[key: string]: string} {
    return SQLitePlugin.openDBs;
  }

  addTransaction(transaction: (tx: SQLiteTransaction) => void): void {
    console.log('Not Implemented');
  }

  transaction(fn: (tx: DbTransaction) => void): Promise<any> {
    return new Promise<any>((resolve, reject) => this._objectInstance.transaction(fn, reject, resolve));
  }

  readTransaction(fn: (tx: SQLiteTransaction) => void): Promise<any> {
    return new Promise<any>((resolve, reject) => this._objectInstance.readTransaction(fn, reject, resolve));
  }

  startNextTransaction(): void {
    this._objectInstance.startNextTransaction();
  }

  open(): Promise<any> {
    return new Promise<any>((resolve, reject) => this._objectInstance.open(resolve, reject));
  }

  close(): Promise<any> {
    return new Promise<any>((resolve, reject) => this._objectInstance.close(resolve, reject));
  }

  executeSql(statement: string, params?: any[]): Promise<any> {
    return new Promise<any>((resolve, reject) => this._objectInstance.executeSql(statement, params, resolve, reject));
  }

  sqlBatch(sqlStatements: (string | string[] | any)[]): Promise<any> {
    return new Promise<any>((resolve, reject) => this._objectInstance.sqlBatch(sqlStatements, resolve, reject));
  }

  abortallPendingTransactions(): void {
    this._objectInstance.abortAllPendingTransactions();
  }
}