import { Injectable } from "@angular/core";
import { SQLError } from "./sqlite-error";
import { SQLiteObject } from "./sqlite-object";
import { SQLitePlugin } from "./sqlite-plugin";
import { SQLiteDatabaseConfig } from "./sqlite-types";

@Injectable()
export class SQLite3Service {
  create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
    return new Promise<SQLiteObject>((resolve, reject) => {
      new SQLitePlugin(config, (sqlitePlugin: SQLitePlugin) => {
        resolve(new SQLiteObject(sqlitePlugin));
      }, reject);
    });
  }

  echoTest(): Promise<any> {
    return Promise.resolve('Not implemented');
  }

  selfTest(): Promise<any> {
    return Promise.resolve('Not implemented');
  }

  deleteDatabase(config: SQLiteDatabaseConfig): Promise<any> {
    const otherArgs = { path: config.name };
    delete SQLitePlugin.openDBs[otherArgs.path];
    return new Promise<any>((resolve, reject) => {
      _cdvElectronIpc.exec(resolve, reject, 'CordovaElectronSqlite', 'deleteDatabase', otherArgs);
    });
  }
}