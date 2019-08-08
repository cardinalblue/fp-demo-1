import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// *********************************************************************
// Combine Function/Foo and Try3 Wrappers
// *********************************************************************

// ============================================================
// Rewrite Foo and TryX more functionally

class Foo<ENV, M> {
  f: (env: ENV) => M;
  constructor(f: (env: ENV) => M) {
    this.f = f;
  }
  map<R>(f2: (m: M) => ((env: ENV) => R)): Foo<ENV, R> {
    // Re-wrapping
    return new Foo((env: ENV): R => {
      const f1    = this.f;
      const m: M = f1(env);   // Unwrap, then call
      const rf   = f2(m);     // <-- Call the second function, but using "map"
      const r    = rf(env);
      return r;
    });
  }
}

class TryX<T> {
  error: boolean;
  value: T;
  constructor(value: T, error: boolean = false, ) {
    this.value = value;
    this.error = error;
  }
  map<R>(f: (t: T) => TryX<R>) {
    const r = f(this.value);  // <-- Call the function, but using "map"
    return new TryX(r.value, this.error || r.error);
  }
}

// ============================================================

it('Foo works', () => {

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

it('TryX works', () => {

  var $errorDb      = false;
  var $errorUser    = false;
  var $errorCollage = false;

  function getDb() {
    return new TryX(new Db(), $errorDb);    // <--- Return a Try instead of a
  }
  function getUser(db: Db) {
    return new TryX(new User(), $errorUser);
  }
  function getCollage(user: User) {
    return new TryX(new Collage(), $errorCollage);
  }

  function loadCollage() {
    return getDb()
      .map(getUser)      // Same as (db: Db) => getUser(db)
      .map(getCollage)   // Same as (user: User) => getCollage(user));
  };

  // ------------------------------------------------------------

  expect(loadCollage()).toBeInstanceOf(TryX);

  $errorDb      = false;
  $errorUser    = false;
  $errorCollage = false;
  expect(loadCollage().error).toBeFalsy();
  expect(loadCollage().value).toBeInstanceOf(Collage);

  $errorDb      = true;
  $errorUser    = false;
  $errorCollage = false;
  expect(loadCollage().error).toBeTruthy();

  $errorDb      = false;
  $errorUser    = true;
  $errorCollage = false;
  expect(loadCollage().error).toBeTruthy();

  $errorDb      = false;
  $errorUser    = false;
  $errorCollage = true;
  expect(loadCollage().error).toBeTruthy();

});

it('Combination works', () => {

  type Env = {
    db_id:         string,
    user_name:     string,
    collage_title: string,

    errorDb:       boolean,
    errorUser:     boolean,
    errorCollage:  boolean,
  }

  // In this experiment, we want to put the Env on the outside, because
  // it determines whether we go into Error

  function getDb() {
    return (env: Env) =>
      new TryX(new Db(env.db_id));
  }
  function getUser(_db: TryX<Db>) {
    return (env: Env) =>
      _db.map(db =>
        new TryX(new User(db.id + "/" + env.user_name), env.errorUser));
  }
  function getCollage(_user: TryX<User>) {
    return (env: Env) =>
      _user.map(user =>
        new TryX(new Collage(user.name + "/" + env.collage_title), env.errorCollage));
  }

  function loadCollage() {
    return new Foo(getDb())
      .map(getUser)      // Same as (db: Db) => getUser(db)
      .map(getCollage)   // Same as (user: User) => getCollage(user));
  };

});