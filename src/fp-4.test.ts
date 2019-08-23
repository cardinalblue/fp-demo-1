import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// Can be used to pass down state or a common context or environment

// *********************************************************************
// "Wrapper" is a function.
// We put inside an object so that it looks the same.
// *********************************************************************

class Foo<ENV, M> {
  constructor(readonly f: (env: ENV) => M) {}

  map<R>(f2: (m: M) => ((env: ENV) => R)): Foo<ENV, R> {
    // Re-wrapping
    return new Foo((env: ENV): R => {
      const f1   = this.f;
      const m: M = f1(env);   // Unwrap, then call
      const rf   = f2(m);
      const r    = rf(env);         // Call the second function
      return r;
    });
  }
}

// ============================================================

it('Foo also works', () => {

  type Env = {
    db_id: string,
    user_name: string,
    collage_title: string
  }

  function getDb() {
    return (env: Env) => new Db(env.db_id);
  }
  function getUser(db: Db) {
    return (env: Env) => new User(db.id + "/" + env.user_name);
  }
  function getCollage(user: User) {
    return (env: Env) => new Collage(user.name + "/" + env.collage_title);
  }

  function loadCollage() {
    return new Foo(getDb())
      .map(getUser)      // Same as (db: Db) => getUser(db)
      .map(getCollage)   // Same as (user: User) => getCollage(user));
  };

  const env1: Env = { db_id: "db1", user_name: "user1", collage_title: "collage1"};
  const c1 = loadCollage().f(env1);
  expect(c1.title).toBe("db1/user1/collage1");

  const env2: Env = { db_id: "db2", user_name: "user2", collage_title: "collage2"};
  const c2 = loadCollage().f(env2);
  expect(c2.title).toBe("db2/user2/collage2");

});