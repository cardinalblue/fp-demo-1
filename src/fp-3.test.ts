import {TestScheduler} from 'rxjs/testing';
import {Collage, Db, User} from "./fp";

// Unwrap, call function, and then flatten the Wrapper

class Try2<T> {
  error: boolean;
  value: T;
  constructor(value: T, error: boolean = false, ) {
    this.value = value;
    this.error = error;
  }
  map<R>(f: (t: T) => Try2<R>) {
    const r = f(this.value);
    return new Try2(r.value, this.error || r.error);
  }
}

var $errorDb      = false;
var $errorUser    = false;
var $errorCollage = false;

function getDb() {
  return new Db();    // <--- Return a Try instead of a
}
function getUser(db: Db) {
  return new Try2(new User(), $errorUser);
}
function getCollage(user: User) {
  return new Try2(new Collage(), $errorCollage);
}

// ============================================================

function loadCollage() {
  return new Try2(getDb(), $errorDb)
    .map(getUser)      // Same as (db: Db) => getUser(db)
    .map(getCollage)   // Same as (user: User) => getCollage(user));
};

it('works', () => {
  expect(loadCollage()).toBeInstanceOf(Try2);

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