import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// *********************************************************************
// One function returns Try, unwraps input before function
// *********************************************************************

class Try<T> {
  error: boolean;
  value: T;
  constructor(value: T, error: boolean = false, ) {
    this.value = value;
    this.error = error;
  }
  map<R>(f: (t: T) => R): Try<R> {
    const r = f(this.value);
    return new Try(r, this.error);
  }
}

// ============================================================

it('works', () => {

  var $errorDb = false;
  function getDb() {
    return new Try(new Db(), $errorDb);
  }
  function getUser(db: Db) {
    return new User();
  }
  function getCollage(user: User) {
    return new Collage();
  }

  function loadCollage() {
    return getDb()
      .map(getUser)      // Same as (db: Db) => getUser(db)
      .map(getCollage)   // Same as (user: User) => getCollage(user));
  };

  // ------------------------------------------------

  expect(loadCollage()).toBeInstanceOf(Try);

  $errorDb = false;
  expect(loadCollage().error).toBeFalsy();
  expect(loadCollage().value).toBeInstanceOf(Collage);

  $errorDb = true;
  expect(loadCollage().error).toBeTruthy();
  expect(loadCollage().value).toBeInstanceOf(Collage);

});