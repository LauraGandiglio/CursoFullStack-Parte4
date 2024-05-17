const _ = require("lodash");

const dummy = (blogs) => 1;

const totalLikes = (blogs) =>
  blogs.reduce((total, blogItem) => total + blogItem.likes, 0);

const favoriteBlog = (blogs) => {
  const likesArray = blogs.map((blog) => blog.likes);
  const blogIndex = likesArray.indexOf(Math.max(...likesArray));
  return blogs[0] ? blogs[blogIndex] : [];
};

const mostBlogs = (blogs) => {
  const authorGroups = _.groupBy(blogs, "author");
  const listOfAuthors = Object.keys(authorGroups);
  const totalBlogs = Object.values(authorGroups).map(
    (authorBlogs) => authorBlogs.length
  );
  const i = totalBlogs.indexOf(Math.max(...totalBlogs));
  return blogs[0] ? { author: listOfAuthors[i], blogs: totalBlogs[i] } : [];
};

const mostLikes = (blogs) => {
  const authorGroups = _.groupBy(blogs, "author");
  const listOfAuthors = Object.keys(authorGroups);
  const listOfLikes = Object.values(authorGroups).map((blog) =>
    blog.reduce((sum, item) => sum + item.likes, 0)
  );
  const i = listOfLikes.indexOf(Math.max(...listOfLikes));
  return blogs[0]
    ? { author: listOfAuthors[i], likes: listOfLikes[i] }
    : [];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
