const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");

const User = require("../models/user");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("hola", 10);

  const user = new User({ username: "rootadmin", passwordHash });
  await user.save();
});

describe("POST user", () => {
  // add a blog, check that the number of blogs has increased
  //by 1 and that the new blog is in the list
  test("an invalid user cant be added ", async () => {
    const newUser = {
      username: "Facundillo",
      name: "Facundo Acosta",
      password: "12",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);

    assert(result.body.error.includes("The password is too short"));
  });
});
