const Group = require("../models/Group");
const User = require("../models/User");
const Post = require("../models/Post");

module.exports = {
    getGroup: async (req, res) => {
      try {
        //console.log(req);
        const group = await Group.findById(req.params.id);
        res.render("group.ejs", {group: group, user: req.user});
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

    //Add a member to a group
    addMember: async (req, res) => {
      try {
        console.log(req.body.username);

        //retreive the group we want to add the user to. Grab the user we want to add to the group
        const group = await Group.findById(req.params.id);
        const user = await User.find({userName: req.body.username});

        //debugging checks
        console.log('User we want to add is' + user)
        console.log('User id we want to add is' + user.id);
        console.log('Group we want to add user to is' + group);

        //Check if the user is already in the group we want to add them to
        const groupCheck = await User.find({ $or: [{ userName: req.body.username }, {groups: req.params.id }] });
        console.log('groupCheck is' + groupCheck);

        await User.findOneAndUpdate(
          {userName: req.body.username},
          {
            $push: {groups: req.params.id}
          }
        );

        await Group.findOneAndUpdate(
          {userName: req.body.username},
          {
            $push: {members: user._id}
          }
        );
        
        /*
        group.members.push({_id: user._id})
        group.save();*/

        console.log("member added is:" + req.body.username);
        req.flash("success", `Success! You have added ${req.body.username}`);
        res.redirect(`/groups/${req.params.id}`)
        //Extracts the groupmember from the members array in the mongoose groups model
        /*let groupMember = group.members.find(username => username == req.body.username)
        console.log('groupMember is:' + groupMember);
        if() {
          req.flash("error", `${req.body.username} already exists in this group`);
          return res.redirect(`/groups/${req.params.id}`)
        }
        await Group.findOneAndUpdate(
          {_id: req.params.id},
          {
            $push: { members: req.body.username}
          }
        );
        console.log("member added is:" + req.body.username);
        req.flash("success", `Success! You have added ${req.body.username}`);
        res.redirect(`/groups/${req.params.id}`)
        */
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