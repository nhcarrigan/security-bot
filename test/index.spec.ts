import { assert } from "chai";

import main from "../src/index";

suite("This is an example test", () => {
  test("It uses the assert API", () => {
    assert.isFunction(main, "main is not a function");
    assert.equal(
      main("Naomi"),
      "Hello Naomi!",
      "main did not return the expected string"
    );
  });
});
