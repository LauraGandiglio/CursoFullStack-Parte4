const jwt = require("jsonwebtoken");
const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const { tokenValidator, userExtractor } = require("../utils/middleware");
const getTokenFrom = (request) => {
  console.log(request.headers);
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

//GET all
blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

//POST blogs
blogsRouter.post("/", userExtractor, async (request, response) => {
  const body = request.body;
  if (!request.user) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const user = request.user;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
    user: user._id,
  });
  if (!blog.likes) {
    blog.likes = 0;
  }
  if (!blog.title || !blog.url) {
    return response
      .status(400)
      .json({ error: "title, author, and url are required" })
      .end();
  }

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

//DELETE one
blogsRouter.delete("/:id",userExtractor, async (request, response) => {
  const id = request.params.id;
  const blog = await Blog.findById(id);
  const userId = request.user._id.toString();

  if (blog.user.toString() === userId) {
    await Blog.findByIdAndDelete(id);
    response.status(204).end();
  }
});

//UPDATE one
blogsRouter.put("/:id", async (request, response) => {
  const { title, author, url, likes } = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true, context: "query" }
  );

  response.json(updatedBlog);
});

module.exports = blogsRouter;
