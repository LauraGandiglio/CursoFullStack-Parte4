const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

// POST users
usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;


  console.log(password.length);
  if (password.length < 3) {
    return response.status(400).json({ error: "The password is too short" });
  }

   const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

//GET users
usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });
  response.json(users);
});

module.exports = usersRouter;
