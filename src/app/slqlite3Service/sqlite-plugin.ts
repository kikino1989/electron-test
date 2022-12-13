import { SQLError } from "./sqlite-error";
import { SQLitePluginTransaction } from "./sqlite-plugin-transaction";


const nextTick = (fun: () => void) => {
    setTimeout(fun, 0);
};

const DB_STATE_INIT = "INIT";

const DB_STATE_OPEN = "OPEN";

export class SQLitePlugin {
    dbname: string;
    static openDBs = {};
    static txLocks = {};
    constructor(private openargs: { name: string }, private openSuccess: (obj: SQLitePlugin) => void, private openError: (err: Error) => void) {
        this.openargs = openargs;
        this.dbname = openargs['name'];
        this.openSuccess = openSuccess;
        this.openError = openError;
        this.openSuccess || (this.openSuccess = () => {
            console.log("DB opened: " + this.dbname);
        });

        this.openError || (this.openError = e => {
            console.log(e.message);
        });
        this.open(this.openSuccess, this.openError);
    }

    addTransaction(tx: SQLitePluginTransaction): void {
        if (!SQLitePlugin.txLocks[this.dbname]) {
            SQLitePlugin.txLocks[this.dbname] = {
                queue: [],
                inProgress: false
            };
        }

        SQLitePlugin.txLocks[this.dbname].queue.push(tx);
        if (this.dbname in SQLitePlugin.openDBs && SQLitePlugin.openDBs[this.dbname] !== DB_STATE_INIT) {
            return this.startNextTransaction();
        }

        if (this.dbname in SQLitePlugin.openDBs) {
            return console.log('new transaction is queued, waiting for open operation to finish');
        }

        console.log('database is closed, new transaction is [stuck] waiting until db is opened again!');
    }

    open(success: (obj: SQLitePlugin) => void, error: (e: Error) => void): void {
        if (this.dbname in SQLitePlugin.openDBs) {
            console.log('database already open: ' + this.dbname);
            nextTick(() => {
                success(this);
            });
            return;
        }

        console.log('OPEN database: ' + this.dbname);
        const opensuccesscb = () => {
            let txLock;
            console.log('OPEN database: ' + this.dbname + ' - OK');
            if (!SQLitePlugin.openDBs[this.dbname]) {
                console.log('database was closed during open operation');
            }
            if (this.dbname in SQLitePlugin.openDBs) {
                SQLitePlugin.openDBs[this.dbname] = DB_STATE_OPEN;
            }
            if (!!success) {
                success(this);
            }
            txLock = SQLitePlugin.txLocks[this.dbname];
            if (!!txLock && txLock.queue.length > 0 && !txLock.inProgress) {
                this.startNextTransaction();
            }
        };
        const openerrorcb = (e) => {
            console.error('Native Error:', e);
            console.log('OPEN database: ' + this.dbname + ' FAILED, aborting any pending transactions');
            if (!!error) {
                error(new SQLError('Could not open database'));
            }
            delete SQLitePlugin.openDBs[this.dbname];
            this.abortAllPendingTransactions();
        };

        SQLitePlugin.openDBs[this.dbname] = DB_STATE_INIT;
        const step2 = () => {
            _cdvElectronIpc.exec(opensuccesscb, openerrorcb, 'CordovaElectronSqlite', 'openDatabase', this.openargs);
        };
        _cdvElectronIpc.exec(step2, step2, 'CordovaElectronSqlite', 'closeDatabase', {
            path: this.dbname
        });
    }

    startNextTransaction(): void {
        nextTick(() => {
            let txLock;
            if (!(this.dbname in SQLitePlugin.openDBs) || SQLitePlugin.openDBs[this.dbname] !== DB_STATE_OPEN) {
                console.log('cannot start next transaction: database not open');
                return;
            }

            txLock = SQLitePlugin.txLocks[this.dbname];
            if (!txLock) {
                console.log('cannot start next transaction: database connection is lost');
                return;
            }

            if (txLock.queue.length > 0 && !txLock.inProgress) {
                txLock.inProgress = true;
                txLock.queue.shift().start();
            }
        });
    }

    abortAllPendingTransactions(): void {
        let j, len1, ref, tx;
        const txLock = SQLitePlugin.txLocks[this.dbname];
        if (!txLock || txLock.queue.length === 0) {
            return;
        }
        ref = txLock.queue;
        for (j = 0, len1 = ref.length; j < len1; j++) {
            tx = ref[j];
            tx.abortFromQ(new SQLError('Invalid database handle'));
        }
        txLock.queue = [];
        txLock.inProgress = false;
    }

    transaction(fn: (tx: SQLitePluginTransaction) => void, error: (e) => void, success: (a) => void): void {
        if (!SQLitePlugin.openDBs[this.dbname]) {
            error(new SQLError('database not open'));
            return;
        }
        this.addTransaction(new SQLitePluginTransaction(this, fn, error, success, true, false));
    }

    readTransaction(fn: (tx: SQLitePluginTransaction) => void, error: (e) => void, success: (a) => void): void {
        if (!SQLitePlugin.openDBs[this.dbname]) {
            error(new SQLError('database not open'));
            return;
        }
        this.addTransaction(new SQLitePluginTransaction(this, fn, error, success, false, true));
    }

    close(success: (a) => void, error: (e) => void): void {
        if (this.dbname in SQLitePlugin.openDBs) {
            if (SQLitePlugin.txLocks[this.dbname] && SQLitePlugin.txLocks[this.dbname].inProgress) {
                console.log('cannot close: transaction is in progress');
                error(new SQLError('database cannot be closed while a transaction is in progress'));
                return;
            }

            console.log('CLOSE database: ' + this.dbname);
            delete SQLitePlugin.openDBs[this.dbname];
            if (SQLitePlugin.txLocks[this.dbname]) {
                console.log('closing db with transaction queue length: ' + SQLitePlugin.txLocks[this.dbname].queue.length);
            } else {
                console.log('closing db with no transaction lock state');
            }

            _cdvElectronIpc.exec(success, error, 'CordovaElectronSqlite', 'closeDatabase', {
                path: this.dbname
            });
            return;
        }

        console.log('cannot close: database is not open');
        if (error) {
            nextTick(() => {
                return error(null);
            });
        }
    }

    executeSql(statement: string, params: any[], success: (r) => void, error: (e) => void): void {
        this.addTransaction(new SQLitePluginTransaction(this, (tx) => {
            tx.addStatement(statement, params, (t, r) => {
                if (!!success) {
                    return success(r);
                }
            }, (t, e) => {
                if (!!error) {
                    return error(e);
                }
            });
        }, null, null, false, false));
    }

    sqlBatch(sqlStatements: string[] | string[][], success, error): void {
        let j, len1, st;
        const batchList = [];
        for (j = 0, len1 = sqlStatements.length; j < len1; j++) {
            st = sqlStatements[j];
            if (st.constructor === Array) {
                if (st.length === 0) {
                    throw new SQLError('sqlBatch array element of zero (0) length');
                }

                batchList.push({
                    sql: st[0],
                    params: st.length === 0 ? [] : st[1]
                });
            } else {
                batchList.push({
                    sql: st,
                    params: []
                });
            }
        }

        this.addTransaction(new SQLitePluginTransaction(this, (tx) => {
            let elem, k, len2;
            const results = [];
            for (k = 0, len2 = batchList.length; k < len2; k++) {
                elem = batchList[k];
                results.push(tx.addStatement(elem.sql, elem.params, null, null));
            }
            return results;
        }, error, success, true, false));
    }
}
