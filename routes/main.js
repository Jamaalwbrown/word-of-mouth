const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const passwordController = require("../controllers/password")
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes
router.get("/", homeController.getIndex);
router.get("/profile", ensureAuth, postsController.getProfile);
router.get("/about", homeController.getAbout);
router.get("/feed", ensureAuth, postsController.getFeed);
router.get("/login", authController.getLogin);
router.get("/showCreatePost", postsController.showCreatePost);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);
router.get("/getdeleteAcct", ensureAuth, postsController.getDeleteAcct);
router.delete("/deleteAcct", ensureAuth, authController.deleteAcct);

//Password RESET
router.post('/recover', passwordController.recover);

router.get('/reset', passwordController.getReset);
router.get('/reset/:token', passwordController.reset);

router.post('/reset/:token', passwordController.resetPassword);


module.exports = router;
