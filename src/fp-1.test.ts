import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// *********************************************************************
// Simple, no wrapping
// *********************************************************************

declare global {
  interface Object {
    map<R>(f: (t: any) => R): R;
  }
}
Object.prototype.map = function<R>(f: (t: Object) => R) {
  return f(this);
};

// ============================================================

it('works', () => {

  function getDb() {
    return new Db();
  }
  function getUser(db: Db) {
    return new User();
  }
  function getCollage(user: User) {
    return new Collage();
  }

  function loadCollage0() {
    const db      = getDb();
    const user    = getUser(db);
    const collage = getCollage(user);
    return collage;
  };

  function loadCollage1() {
    return getCollage(
      getUser(
        getDb()
      )
    )
  }
  function loadCollage2() {
    return getCollage(getUser(getDb()));
  };

  function loadCollage3() {
    return getDb()
      .map((db: Db) => getUser(db))
      .map((user: User) => getCollage(user));
  };

  function loadCollage4() {
    return getDb()
      .map(getUser)
      .map(getCollage);
  };
  // --------------------------------------------------------

  class Box<T> {
    constructor(readonly t: T) {
    }
    map<R>(f: (t: T) => R): Box<R> {
      return new Box(f(this.t));
    }
  }

  function loadCollage5() {
    return new Box(getDb())
      .map(getUser)
      .map(getCollage);
  };

  expect(loadCollage1()).toBeInstanceOf(Collage);
  expect(loadCollage2()).toBeInstanceOf(Collage);
  expect(loadCollage3()).toBeInstanceOf(Collage);
  expect(loadCollage4()).toBeInstanceOf(Collage);
});

