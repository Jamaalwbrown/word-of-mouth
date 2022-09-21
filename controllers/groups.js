const Group = require("../models/Group");

module.exports = {
    getGroup: async (req, res) => {
      try {
        //console.log(req);
        const group = await Group.findById(req.params.id);
        res.render("group.ejs", {group: group, user: req.user, msg: req.flash('message')});
      } catch (err) {
        console.log(err);
      }
    },
    createGroup: async (req, res) => {
      try {
        //console.log(req.body);
        await Group.create({
          groupName: req.body.groupName,
          groupDescription: req.body.groupDescription,
          createdBy: req.user.id,
        });
        console.log("A group has been added!");
        res.redirect("/profile");
      } catch (err) {
        console.log(err);
      }
    },
    addMember: async (req, res) => {
      try {
        console.log(req.body.username);
        await Group.findOneAndUpdate(
          {_id: req.params.id},
          {
            $push: { members: req.body.username}
          }
        );
        console.log("member added is:" + req.body.username);
        req.flash("message", `Success! You have added ${req.body.username}`);
        res.redirect(`/groups/${req.params.id}`)
      }
      catch (err) {
        console.log(err);
      }
    }
    /*
    getPost: async (req, res) => {
        try {
          const post = await Post.findById(req.params.id);
          res.render("post.ejs", { post: post, user: req.user });
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
    */
  };