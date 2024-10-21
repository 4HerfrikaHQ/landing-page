import type {
  DriverAdapter,
  Query,
  Queryable,
  Result,
  ResultSet,
  Transaction,
  TransactionContext,
  TransactionOptions,
} from "@prisma/driver-adapter-utils";
import { ok } from "@prisma/driver-adapter-utils";
import { Mutex } from "async-mutex";
import initSqlJS, { Database, ParamsObject } from "sql.js";

const LOCK_TAG = Symbol();

class AlaSQLQueryable implements Queryable {
  readonly provider = "sqlite";
  readonly adapterName = "sqlite3";

  [LOCK_TAG] = new Mutex();

  constructor(protected client?: Database) {}

  /**
   * Execute a query given as SQL, interpolating the given parameters.
   */
  async queryRaw(query: Query): Promise<Result<ResultSet>> {
    const ioResult = this.performIO(query);

    return ok(
      ioResult
        .map(({ value }) => {
          //   const columnTypes = getColumnTypes(declaredColumnTypes, rows);

          return {
            columnNames: [],
            columnTypes: [],
            rows: [],
          } as ResultSet;
        })
        .reduce((a, b) => ({ ...a, ...b }), {} as ResultSet)
    );
  }

  /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */
  async executeRaw(query: Query): Promise<Result<number>> {
    const tag = "[js::execute_raw]";

    return ok(this.performIO(query).length);
  }

  performIO(query: Query): ParamsObject[] {
    // @ts-expect-error - no way to check type of args
    const stmts = this.client!.prepare(query.sql, query.args);
    const results: ParamsObject[] = [];
    while (stmts.step()) {
      results.push(stmts.getAsObject());
    }
    return results;
  }
}

class AlaSQLTransaction extends AlaSQLQueryable implements Transaction {
  constructor(
    client: Database,
    readonly options: TransactionOptions,
    readonly unlockParent: () => void
  ) {
    super(client);
  }

  async commit(): Promise<Result<void>> {
    return ok(undefined);
  }

  async rollback(): Promise<Result<void>> {
    return ok(undefined);
  }
}

class AlaSQLTransactionContext extends AlaSQLQueryable
  implements TransactionContext {
  constructor(readonly client: Database, readonly release: () => void) {
    super(client);
  }

  async startTransaction(): Promise<Result<Transaction>> {
    const options: TransactionOptions = {
      usePhantomQuery: true,
    };

    try {
      return ok(new AlaSQLTransaction(this.client, options, this.release));
    } catch (e) {
      // note: we only release the lock if creating the transaction fails, it must stay locked otherwise,
      // hence `catch` and rethrowing the error and not `finally`.
      this.release();
      throw e;
    }
  }
}

export class AlaSQLAdapter extends AlaSQLQueryable implements DriverAdapter {
  constructor(database: string) {
    super();
  }

  async transactionContext(): Promise<Result<TransactionContext>> {
    const release = await this[LOCK_TAG].acquire();
    const SQL = await initSqlJS({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
    this.client = new SQL.Database();
    return ok(new AlaSQLTransactionContext(this.client, release));
  }
}
