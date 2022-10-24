const Group = require("../models/Group");
const User = require("../models/User");
const Post = require("../models/Post");

module.exports = {
    getGroups: async (req, res) => {
      try {
        //console.log(req);
        const groupsCreated = await Group.find({createdBy: req.user.id })
        const groups = await Group.find({members: req.user.id})
        console.log(groups);
        res.render("groups.ejs", { groupsCreated: groupsCreated, groups: groups, user: req.user });
      }
      catch (err) {
        console.log(err);
      }
    },
    getGroup: async (req, res) => {
      try {
        //console.log(req);
        const group = await Group.findById(req.params.id).populate(
          {
            path: "members", //populate members
            populate: {
              path: "posts" //in members/users, populate posts
            }
          }
          ).lean();
        console.log(group);
        console.log(group.moderators[0])
        console.log(group.members[0]._id)
        res.render("group.ejs", {group: group, user: req.user,});
      } catch (err) {
        console.log(err);
      }
    },
    createGroup: async (req, res) => {
      try {
        // const checkGroupName = await Group.findOne({groupName: req.body.groupName});
        const user = await User.findOne({_id: req.user}).lean();

        // if (checkGroupName) {
        //   req.flash("groupCreateError", `The group name ${req.body.groupName} is already taken`);
        //   return res.redirect(`/profile`);
        // }

        if (user.posts.length == 0) {
          req.flash("noReviewError", `You must have at least one review created before making a group`);
          return res.redirect(`/profile`);
        } 
      //Create the request group based on the groupName
       const group = await Group.create({
          groupName: req.body.groupName,
          groupDescription: req.body.groupDescription,
          memberCount: 1,
          createdBy: req.user.id,
          createdByUser: user.userName,
          members: [req.user.id],
          moderators: [req.user.id],
        });

        //Add the group id to user.groups for the user creating the group
        await User.findOneAndUpdate(
          {_id: req.user},
          {
            $push: {groups: group._id}
          }
        );

        console.log("A group has been added!");

        //redirect to the group page
        req.flash("groupCreateSuccess", `The group name ${req.body.groupName} has been created!`);
        res.redirect("/groups/" + group._id);
      } catch (err) {
        console.log(err);
      }
    },

    //Add a member to a group
    addMember: async (req, res) => {
      try {
        console.log(req.body.username);

        //retreive the group we want to add the user to.
        const group = await Group.findById(req.params.id);

        // Grab the user we want to add to the group
        //Check if the requested user exists. If not add to flash messages and redirect
        const user = await User.findOne({userName: req.body.username})
        if(!user) {
          req.flash("error", `${req.body.username} does not exist as a user`);
          return res.redirect(`/groups/${req.params.id}`)
        }

        if(user.posts.length == 0) {
          req.flash("error", `${req.body.username} currently has no reviews created. Users must have one review to be added into a group`);
          return res.redirect(`/groups/${req.params.id}`)
        }

        //debugging checks
        console.log('User we want to add is' + user)
        console.log('User id we want to add is' + user.id);
        console.log('Group we want to add user to is' + group);

        //Check if the user is already in the group we want to add them to
        const existingUser = await User.findOne({ $and: [{userName: req.body.username}, {groups: req.params.id }] });
        console.log('existingUser is:' + existingUser);

        //If user is already in group, flash error and then redirect to back to group page
        if(existingUser) {
          req.flash("error", `${req.body.username} already exists in this group`);
          return res.redirect(`/groups/${req.params.id}`)
        }

        //Add the group id to user.groups and add the user id to group.members
        await User.findOneAndUpdate(
          {userName: req.body.username},
          {
            $push: {groups: req.params.id}
          }
        );

        await Group.findOneAndUpdate(
          {_id: req.params.id},
          {
            $push: {members: user}, $inc: {memberCount: 1}
          }
        );

        //Create success flash message and then redirect back to the group page
        console.log("member added is:" + req.body.username);
        req.flash("success", `Success! You have added ${req.body.username}`);
        res.redirect(`/groups/${req.params.id}`)
      }
      catch (err) {
        console.log(err);
      }
    },

    addMod: async (req, res) => {
      try {
        console.log(req.body.username);

        //retreive the group we want to add the moderator to.
        const group = await Group.findById(req.params.id);

        // Grab the user we want to add to the group
        //Check if the requested user exists. If not add to flash messages and redirect
        const user = await User.findOne({userName: req.body.username})
        if(!user) {
          req.flash("error", `${req.body.username} does not exist as a user`);
          return res.redirect(`/groups/${req.params.id}`)
        }

        //debugging checks
        console.log('User we want to add is' + user)
        console.log('User id we want to add is' + user.id);
        console.log('Group we want to add user to is' + group);

        //Check if the user is in the group we want them to Moderate
        const existingUser = await User.findOne({ $and: [{userName: req.body.username}, {groups: req.params.id }] });
        console.log('existingUser is:' + existingUser);

        //If user is not in the group then stop
        if(!existingUser) {
          req.flash("error", `${req.body.username} is not a member of this group`);
          return res.redirect(`/groups/${req.params.id}`)
        }

        //Check if the user is already a Moderator
        const existingMod = await Group.findOne({moderators: user.id});
        console.log('existingMod is:' + existingMod);

        //If already a moderator, flash error and then redirect to back to group page
        if(existingMod) {
          req.flash("error", `${req.body.username} is already a Moderator`);
          return res.redirect(`/groups/${req.params.id}`)
        }

        //add the user id to group.moderators
        await Group.findOneAndUpdate(
          {_id: req.params.id},
          {
            $push: {moderators: user}
          }
        );

        //Create success flash message and then redirect back to the group page
        console.log("moderator added is:" + req.body.username);
        req.flash("success", `Success! You have added ${req.body.username} as a moderator`);
        res.redirect(`/groups/${req.params.id}`)
      }
      catch (err) {
        console.log(err);
      }
    },

    removeMember: async (req, res) => {
      try {
        console.log(req.body.username);

        //retreive the group we want to add the moderator to.
        const group = await Group.findById(req.params.id);

        // Grab the user we want to add to the group
        //Check if the requested user exists. If not add to flash messages and redirect
        const user = await User.findOne({userName: req.body.username})
        if(!user) {
          req.flash("error", `${req.body.username} does not exist as a user`);
          return res.redirect(`/groups/${req.params.id}`)
        }

        //debugging checks
        console.log('User we want to add is' + user)
        console.log('User id we want to add is' + user.id);
        console.log('Group we want to add user to is' + group);

        //Check if the user is in the group we want to remove them from
        const existingUser = await User.findOne({ $and: [{userName: req.body.username}, {groups: req.params.id }] });
        console.log('existingUser is:' + existingUser);

        //If user is not in the group then stop
        if(!existingUser) {
          req.flash("error", `${req.body.username} is not a member of this group`);
          return res.redirect(`/groups/${req.params.id}`)
        }

         //Check if the user is already a Moderator
         const orignalCreator = await Group.findOne({ $and: [{moderators: user.id}, {createdBy: user.id }] });
         console.log('orignalCreator is:' + orignalCreator);
 
         //If already a moderator, flash error and then redirect to back to group page
         if(orignalCreator) {
           req.flash("error", `Cannot remove ${req.body.username} who created this group`);
           return res.redirect(`/groups/${req.params.id}`)
         }

        //Remove the group id from user.groups and remove the user id to group.members
        await User.findOneAndUpdate(
          {userName: req.body.username},
          {
            $pull: {groups: req.params.id}
          }
        );

        await Group.findOneAndUpdate(
          {_id: req.params.id},
          {
            $pull: {members: user.id, moderators: user.id}, $inc: {memberCount: -1}
          }
        );

        //Create success flash message and then redirect back to the group page
        console.log("member removed is:" + req.body.username);
        req.flash("success", `Success! You have removed ${req.body.username} from the group`);
        res.redirect(`/groups/${req.params.id}`)
      }
      catch (err) {
        console.log(err);
      }
    },

    showGroupDelete: async (req, res) => {
      try {
        const group = await Group.findById({ _id: req.params.id });
        res.render("deleteGroup.ejs", {group: group, user: req.user});
      } catch (err) {
        res.redirect(`/groups/${req.params.id}`);
      }
    },

    deleteGroup: async (req, res) => {
      try {
        // Find group by id
        let group = await Group.findById({ _id: req.params.id }, (err, result) => {
          if (err) {
            console.log(err)
          }
          else {
            console.log("Result :", result);
          }
        });
        // Delete group id from each User's groups array
        await User.find({groups: req.params.id}).updateMany(
          { $pull: {groups: req.params.id}}
        )

         // Delete group from db
        await Group.remove({ _id: req.params.id });
        console.log("Deleted Group");
        req.flash("groupDeleteSuccess", `You have delete the group: ${group.groupName}`);
        res.redirect("/profile");
      } catch (err) {
        res.redirect("/profile");
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