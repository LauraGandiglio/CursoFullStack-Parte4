const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");
const bcrypt = require("bcrypt");
let token, id;

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }

  await User.deleteMany({});
  const passwordHash = bcrypt.hashSync("abcde", 10);
  const user = new User({
    username: "Laura",
    passwordHash,
  });
  await user.save();
});

describe("GET blogs", () => {
  //test that the request returns json
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  // test that there are two bolgs
  test("there are two blogs", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });

  // test that the authors are the same
  test("the first blog was written by Edsger Test", async () => {
    const response = await api.get("/api/blogs");

    const authors = response.body.map((e) => e.author);
    assert(authors.includes("Edsger Test"));
  });

  // test that unique identifier is named id and exist
  test("unique identifier is named id and exist", async () => {
    const response = await api.get("/api/blogs");

    const ids = response.body.map((e) => e.id);

    assert.strictEqual(ids.length, helper.initialBlogs.length);
  });
});

describe("POST blogs", () => {
  // add a blog, check that the number of blogs has increased
  //by 1 and that the new blog is in the list
  test("a valid new blog can be added", async () => {
    const newBlog = {
      title: "Learn Modern Web Dev - MOOC",
      author: "Laura Gandiglio",
      url: "https://www.fullstackopen.com",
      likes: 15,
    };

    const response = await api
      .post("/api/login")
      .send({
        username: "Laura",
        password: "abcde",
      })
      .expect(200);

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `Bearer ${response.body.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    const authors = blogsAtEnd.map((blog) => blog.author);
    assert.strictEqual(authors.includes("Laura Gandiglio"), true);
  });

  // test that if likes is not defined, is 0
  test("if likes is not defined, is 0", async () => {
    const newBlog = {
      title: "Learn Modern Web Dev - MOOC",
      author: "Laura Gandiglio",
      url: "https://www.fullstackopen.com",
    };

    const response = await api
      .post("/api/login")
      .send({
        username: "Laura",
        password: "abcde",
      })
      .expect(200);

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `Bearer ${response.body.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    const likes = blogsAtEnd.map((r) => r.likes);
    assert.strictEqual(likes[likes.length - 1], 0);
  });

  // if title o url are not defined, return 400 bad request
  test("if title is not defined, the backend returns 400 bad request", async () => {
    const newBlog = {
      author: "Laura Gandiglio",
      url: "https://www.fullstackopen.com",
      likes: 15,
    };

    const response = await api
      .post("/api/login")
      .send({
        username: "Laura",
        password: "abcde",
      })
      .expect(200);

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `Bearer ${response.body.token}`)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
  });

  test("if url is not defined, the backend returns 400 bad request", async () => {
    const newBlog = {
      title: "Learn Modern Web Dev - MOOC",
      author: "Laura Gandiglio",
      likes: 15,
    };

    const response = await api
      .post("/api/login")
      .send({
        username: "Laura",
        password: "abcde",
      })
      .expect(200);

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `Bearer ${response.body.token}`)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
  });
});

describe("DELETE blog", () => {
  test("a blog can be deleted by the user creator", async () => {
    const newBlog = {
      title: "Learn Modern Web Dev - MOOC",
      author: "Laura Gandiglio",
      url: "https://www.fullstackopen.com",
      likes: 15,
    };

    const response = await api
      .post("/api/login")
      .send({
        username: "Laura",
        password: "abcde",
      })
      .expect(200);

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `Bearer ${response.body.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[blogsAtStart.length - 1];
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${response.body.token}`)
      .expect(204);
    const blogsAtEnd = await helper.blogsInDb();
    const authors = blogsAtEnd.map((blog) => blog.author);
    assert.strictEqual(authors.includes("Laura Gandiglio"), false);
  });
});

describe("UPDATE blog", () => {
  test("updates the likes", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = {
      ...blogToUpdate,
      likes: 200,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd[0].likes, 200);
  });
});

after(async () => {
  await mongoose.connection.close();
});
