import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// Simple, no wrapping

declare global {
  interface Object {
    map1<R>(f: (t: any) => R): R;
  }
}

Object.prototype.map1 = function<R>(f: (t: Object) => R) {
  return f(this);
};

function getDb() {
  return new Db();
}
function getUser(db: Db) {
  // Something something
  return new User();
}
function getCollage(user: User) {
  // Something something
  return new Collage();
}

// ============================================================

function loadCollage() {
  return getDb()
    .map1((db: Db) => getUser(db))
    .map1((user: User) => getCollage(user));
};

it('works', () => {
  expect(loadCollage()).toBeInstanceOf(Collage);
});