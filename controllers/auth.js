const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");
const Post = require("../models/Post");
const Group = require("../models/Group");

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      console.log(info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/profile");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    console.log('User has logged out.')
  })
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("signup", {
    title: "Create Account",
  });
};

exports.postSignup = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });


  const post = new Post({
    title: "Word of Mouth Quick Tutorial",
    image: "https://res.cloudinary.com/demvccuww/image/upload/v1665295544/qr0uwcyxa8z82g8li5eb.jpg",
    cloudinaryId: "qr0uwcyxa8z82g8li5eb",
    summary: "Please Read!! Do Not Delete Until You Have Added Your Own Review",
    review: `<h2><strong>Welcome to Word of Mouth! This review serves as a tutorial for you on how to use this application.</strong></h2>

    <p>&nbsp;</p>
    
    <p><ins><strong>Accessing Profile</strong></ins></p>
    
    <p>Going to &#39;<strong>Profile</strong>&#39; in the Navigation Bar at the top will bring you your profile page. Here, you will see important profile information such as your email and username. You will also see two buttons for creating a review and a group as well as all of the reviews you have created so far. Each review will be shown as card with important information about each review such as title, summary, category, and rating. If you would like to delete your account, the button for that is at the bottom of the profile page.</p>
    
    <p>&nbsp;</p>
    
    <p><ins><strong>Accessing Groups</strong></ins></p>
    
    <p>Going to &#39;<strong>Groups</strong>&#39; on the navbar at the top will bring you to the group page where you can create groups and see what groups you are a part of. <strong>Note</strong>: that you must create at least one review in order to create a group. You can either keep this example review or create another review and delete this one. Also, any people you try to add to your groups must have a review. Make sure you check with them before adding them</p>
    
    <p>&nbsp;</p>
    
    <p><ins><strong>Creating Reviews</strong></ins></p>
    
    <p>There is a &#39;<strong>Create Review</strong>&#39; button at the top of your profile page. Clicking on it will bring you to the Create Review page. Here you will fill out the form and click submit in order to create your review. Pay attention to the tips on the page in order to create the perfect review! Once your review is created, a card displaying the title, image, and summary of your review will appear on your profile page</p>
    
    <p>&nbsp;</p>
    
    <p><ins><strong>Creating a Group</strong></ins></p>
    
    <p>From the groups page, you will be able to fill out a form including the name of your group and a small description. Once you submit the form, your group will be created and you will be taken to the group page. As the original creator of the group you are a moderator have full control over the group and it&rsquo;s members. You may choose who to add to the group, who to remove from the group, who to make a moderator or who to remove moderator status from. <strong>Note: Other moderators will not be able to remove your moderator status since you are the original creator of the group.</strong></p>
    
    <p>&nbsp;</p>
    
    <p><ins><strong>Group Page</strong></ins></p>
    
    <p>As you add people to your group, the page will populate with the most recent created or updated review from each member. In the table you will be able to see each member of the group, their number of reviews, and their moderator status.</p>`,
    category: "Other",
    rating: "8",
    likes: 0,
  })


  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    posts: [post._id],
  });

  post.user = user._id;


  User.findOne(
    { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }
      user.save((err) => {
        if (err) {
          return next(err);
        }
        post.save((err) => {
          if (err) {
            return next (err)
          }
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
            res.redirect("/profile");
          })
        })
      })
    }
  );
};

exports.deleteAcct = (req, res) => {
  if(!(req.body.email && req.body.userName)) {
    console.log(req.user._id);
    req.flash("deleteFail", "The credentials you entered were incorrect. Try again");
    return res.redirect('/getDeleteAcct');
  }
  
  User.deleteOne(
    { $and: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err) => {
      if (err) {
        req.flash("deleteInfo","Something went wrong. Please enter your information again");
        console.log('We hit the error')
        return res.redirect('/getDeleteAcct');
      }

      Post.deleteMany({user: req.user}, (err) => {
        if (err) {
          console.log('We hit the deleteMany Error')
          return res.redirect('/getDeleteAcct');
        }

        Group.find({members: req.user}).updateMany({$pull: {members: req.user._id}}, (err) => {
          if(err) {
            console.log('We hit the group updateMany Error')
            return res.redirect('/getDeleteAcct');
          }
          
          req.flash("deleteSuccess", "Your account has been deleted. You must signup again to access Word of Mouth");
          console.log('Deleted Account');
          return res.redirect('/');
        })
          
        })
      })
    };
