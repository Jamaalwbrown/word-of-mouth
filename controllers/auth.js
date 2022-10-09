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

  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    posts: ['632bf368f8d25c3a94be5795'], //add default post to help with mongoose populate method in group controller
  });

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
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/profile");
        });
      });
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
