const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Group = require("../models/Group");
const User = require("../models/User")

module.exports = {
  getProfile: async (req, res) => {
    try {
      //We find the posts created by the user
      const posts = await Post.find({ user: req.user.id });

      //Find the groups created by the user
      const groupsCreated = await Group.find({createdBy: req.user.id })

      //Find the groups that the user is a member of
      const groups = await Group.find({members: req.user.id})

      //Send the User's posts, created groups, and groups that the user is a part of to the profile ejs
      res.render("profile.ejs", { posts: posts, user: req.user, groupsCreated: groupsCreated, groups: groups, createdBy: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log(req.body);
      const post = await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        summary: req.body.summary,
        review: req.body.review,
        likes: 0,
        user: req.user.id,
      });

      await User.findOneAndUpdate(
        {_id: req.user.id},
          {
            $push: {posts: post}
          }
        );
      console.log("A review has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
