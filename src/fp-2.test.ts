import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// One function returns Try, unwraps input before function

class Try1<T> {
  error: boolean;
  value: T;
  constructor(value: T, error: boolean = false, ) {
    this.value = value;
    this.error = error;
  }
  map<R>(f: (t: T) => R): Try1<R> {
    const r = f(this.value);
    return new Try1(r, this.error);
  }
}


function getDb() {
  return new Db();
}
function getUser(db: Db) {
  return new User();
}
function getCollage(user: User) {
  return new Collage();
}

// ============================================================

var $errorDb = false;

function loadCollage() {
  return new Try1(getDb(), $errorDb)
    .map(getUser)      // Same as (db: Db) => getUser(db)
    .map(getCollage)   // Same as (user: User) => getCollage(user));
};

it('works', () => {
  expect(loadCollage()).toBeInstanceOf(Try1);

  $errorDb = false;
  expect(loadCollage().error).toBeFalsy();
  expect(loadCollage().value).toBeInstanceOf(Collage);

  $errorDb = true;
  expect(loadCollage().error).toBeTruthy();
  expect(loadCollage().value).toBeInstanceOf(Collage);

});