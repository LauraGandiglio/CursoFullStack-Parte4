const Blog = require("../models/blog");
const User = require("../models/user");

// BLOGS
const initialBlogs = [
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger Test",
    url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
    likes: 5,
  },
  {
    title: "Go To Statement Considered Harm",
    author: "Edsger W. Dijkstra",
    url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
    likes: 0,
  },
];

//Retorna un id que no esté en uso en la BD
const nonExistingId = async () => {
  const blog = new Blog({
    title: "unused Id",
    author: "LG",
    url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
    likes: 0,
  });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

//se pueden verificar todos los blogs de la BD
const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

// USERS
const initialUsers = [
  {
    username: "Lardilla",
    name: "Laura Gandiglio",
    blogs: [],
  },
];

//se pueden verificar todos los users de la BD
const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  initialUsers,
  usersInDb,
};
