# [WOM (Word of Mouth)](#)

Word of Mouth is a full-stack application in which users can post reviews of whatever they want and share them with close-knit communities like families, friends, or coworkers.

## How It's Made:

**Tech used:** Html, Css, JavaScript, Ejs, Node.js, Express, MongoDB, Cloudinary, Passport

## Optimizations

-   Adding a friends feature. Currently users are only able to interact within groups

## Lessons Learned:

### <u>Group Organization & Mongoose .populate method</u>
Organizing users into groups one of the biggest barriers in the development of this application. MongoDB is lacking in the area of joining documents/models together. In order to get around this I read up on the mongoose populate method which ended up solving my problem. I was able to tie specific groups with the users that are members of those specific groups and then use the .populate mongoose method to expand each User's data to have access to it in my views. For each user that is a member of a specific group, I then use .populate to expand and access the data of each review/post that user has made. Using .populate allowed me to display members of each group on the group page as well as each member's most recent review/post.

## Package dependencies
bcrypt, cloudinary, connect-mongo, dotenv, ejs, express, express-flash, express-session, method-override, mongodb, mongoose, morgan, multer, nodemon, passport, passport-local, validator, xmlhttprequest, tailwindcss, daisyui

