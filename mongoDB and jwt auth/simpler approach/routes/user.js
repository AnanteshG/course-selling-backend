const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { Admin, User, Course } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

// User Routes
router.post("/signup", async (req, res) => {
  // Implement user signup logic
  const username = req.body.username;
  const password = req.body.password;

  await User.create({
    username: username,
    password: password,
  });

  res.json({
    message: "User created successfully",
  });
});

router.post("/signin", async (req, res) => {
  // Implement admin signup logic
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.find({
    username,
    password,
  });
  if (user) {
    const token = jwt.sign(
      {
        username,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } else {
    res.status(411).json({
      message: "Incorrect email and password",
    });
  }
});

router.get("/courses", userMiddleware, async (req, res) => {
  // Implement listing all courses logic
  try {
    const allCourses = await Course.find();
    return res.status(200).send({ courses: allCourses });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching all courses" });
  }
});

router.post("/courses/:courseId", userMiddleware, async (req, res) => {
  // Implement course purchase logic
  const username = req.username;
  const courseId = req.params.courseId;
  if (!courseId) {
    return res.status(400).send({ message: "Course ID is required" });
  }
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).send({ message: "Course not found" });
    }
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    user.purchasedCourses.push(course);
    await user.save();
    return res.status(200).send({ message: "Course purchased successfully" });
  } catch (error) {
    return res.status(500).send({ message: "Error purchasing course" });
  }
});

router.get("/purchasedCourses", userMiddleware, (req, res) => {
  // Implement fetching purchased courses logic
  const username = req.username;
  User.findOne.findOne.populate("purchasedCourses").exec((err, user) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error fetching purchased courses" });
    }
    return res.status(200).send({ purchasedCourses: user.purchasedCourses });
  });
});

module.exports = router;
