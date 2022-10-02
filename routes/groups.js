const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const groupsController = require("../controllers/groups");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Group Routes

router.get("/:id", ensureAuth, groupsController.getGroup);
router.get("/", ensureAuth, groupsController.getGroups);
router.post("/createGroup", groupsController.createGroup);
router.put("/addMember/:id", groupsController.addMember);
router.delete("/deleteGroup/:id", groupsController.deleteGroup);

module.exports = router;