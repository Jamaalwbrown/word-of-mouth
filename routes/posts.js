const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, postsController.getPost);

router.get("/show/:id", postsController.showPosts);

router.get("/showEdit/:id", postsController.showEdit);

router.get("/showDelete/:id", postsController.showDeletePost);

router.post("/createPost", upload.single("file"), postsController.createPost);

router.put("/likePost/:id", postsController.likePost);

router.put("/editPost/:id", upload.single("file"), postsController.editPost);

router.delete("/deletePost/:id", postsController.deletePost);

module.exports = router;
