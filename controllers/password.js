const User = require('../models/User');

const nodemailer = require("nodemailer");
const validator = require("validator"); 

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
  });

// ===PASSWORD RECOVER AND RESET

// @route POST api/auth/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
exports.recover = (req, res) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
        validationErrors.push({ msg: "Please enter a valid email address." });

    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("/reset");
        }

    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                req.flash("errors", {msg: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});
                return res.redirect("/reset")
            }
            //Generate and set password reset token
            user.generatePasswordReset();

            // Save the updated user object
            user.save()
                .then(user => {
                    // send email
                    let link = "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;

                    let mailOptions = {
                        from: `Word Of Mouth <${process.env.MAIL_USERNAME}`,
                        to: user.email,
                        subject: 'Password Change Request',
                        text: `Hi ${user.userName} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`
                    };

                    transporter.sendMail(mailOptions, function(err, data) {
                        if (err) {
                          console.log("Error " + err);
                          return res.status(500).json({message: err.message});
                        } else {
                          console.log("Email sent successfully");
                          res.status(200).json({message: 'A reset email has been sent to ' + user.email + '.'});
                        }
                      });
                })
                .catch(err => res.status(500).json({message: err.message}));
        })
        .catch(err => res.status(500).json({message: err.message}));
};

// @route POST api/auth/reset
// @desc Reset Password - Validate password reset token and shows the password reset view
// @access Public
exports.reset = (req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

            //Redirect user to form with the email address
            res.render('resetPassword', {user});
        })
        .catch(err => res.status(500).json({message: err.message}));
};


// @route POST api/auth/reset
// @desc Reset Password
// @access Public
exports.resetPassword = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.password))
        validationErrors.push({ msg: "Password cannot be blank." });

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

    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

            //Set the new password
            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // Save
            user.save((err) => {
                if (err) return res.status(500).json({message: err.message});

                // send email
                let mailOptions = {
                    from: `Word Of Mouth <${process.env.MAIL_USERNAME}`,
                    to: user.email,
                    subject: "Your password has been changed",
                    text: `Hi ${user.userName} \n 
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                };

                transporter.sendMail(mailOptions, function(err, data) {
                    if (err) {
                      console.log("Error " + err);
                      return res.status(500).json({message: err.message});
                    } else {
                      console.log("Email sent successfully");
                      res.status(200).json({message: 'Your password has been updated.'});
                    }
                });
            });
        });
}; 
exports.getReset = (req, res) => {
    res.render("reset.ejs");
};