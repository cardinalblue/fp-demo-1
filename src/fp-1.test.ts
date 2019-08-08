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

  function loadCollage() {
    return getDb()
      .map((db: Db) => getUser(db))
      .map((user: User) => getCollage(user));
  };

  // --------------------------------------------------------

  expect(loadCollage()).toBeInstanceOf(Collage);
});