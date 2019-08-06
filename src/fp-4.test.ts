import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// "Wrapper" is a function

type Env = {
  db_id: string,
  user_name: string,
  collage_title: string
}

class Foo<ENV, M> {
  f: (env: ENV) => M;
  constructor(f: (env: ENV) => M) {
    console.log(">>>> Foo");
    this.f = f;
  }
  map4<R>(f2: (m: M) => ((env: ENV) => R)): Foo<ENV, R> {
    return new Foo((env: ENV): R => {
      const f1 = this.f;
      const m: M = f1(env);   // Unwrap, then call
      return f2(m)(env);      // Re-wrap
    });
  }
}

function getDb() {
  console.log(">>>> getDb");
  return (env: Env) => new Db(env.db_id);
}
function getUser(db: Db) {
  console.log(">>>> getUser");
  return (env: Env) => new User(db.id + "/" + env.user_name);
}
function getCollage(user: User) {
  console.log(">>>> getCollage");
  return (env: Env) => new Collage(user.name + "/" + env.collage_title);
}

// ============================================================

function loadCollage() {
  return new Foo(getDb())
    .map4(getUser)      // Same as (db: Db) => getUser(db)
    .map4(getCollage)   // Same as (user: User) => getCollage(user));
};

it('works', () => {

  const env1: Env = { db_id: "db1", user_name: "user1", collage_title: "collage1"};
  const c1 = loadCollage().f(env1);
  expect(c1.title).toBe("db1/user1/collage1");

  const env2: Env = { db_id: "db2", user_name: "user2", collage_title: "collage2"};
  const c2 = loadCollage().f(env2);
  expect(c2.title).toBe("db2/user2/collage2");

});