import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// *********************************************************************
// Unwrap, call function, and then flatten the Wrapper
// *********************************************************************

class TryX<T> {
  error: boolean;
  value: T;
  constructor(value: T, error: boolean = false, ) {
    this.value = value;
    this.error = error;
  }
  map<R>(f: (t: T) => TryX<R>) {
    const r = f(this.value);
    return new TryX(r.value, this.error || r.error);
  }
}

// ============================================================

it('works', () => {

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