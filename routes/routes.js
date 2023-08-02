const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

router.post("/add", upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });
    await user.save();

    req.session.message = {
      type: "success",
      message: "User added successfully!",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

router.get("/", (req, res) => {
  User.find()
    .exec()
    .then((users) => {
      res.render("index.ejs", {
        title: "Home Page",
        users: users,
      });
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

router.get("/add", (req, res) => {
  res.render("add_users.ejs", { title: "Add Users" });
});

router.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      res.render("edit_users.ejs", {
        title: "Edit User",
        user: user,
      });
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/");
    });
});

router.post("/update/:id", upload, (req, res) => {
  const id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync('./uploads/' + req.body['old-image']);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body['old-image'];
  }

  User.findByIdAndUpdate(id, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: new_image,
  })
    .then((result) => {
      req.session.message = {
        type: 'success',
        message: 'User updated successfully!',
      };
      res.redirect('/');
    })
    .catch((err) => {
      res.json({ message: err.message, type: 'danger' });
    });
});

router.get('/delete/:id', (req, res) => {
  const id = req.params.id;

  User.findByIdAndDelete(id)
    .then((deletedUser) => {
      if (!deletedUser) {
        return res.json({ message: 'User not found!', type: 'danger' });
      }

      if (deletedUser.image !== '') {
        try {
          fs.unlinkSync('./uploads/' + deletedUser.image);
        } catch (err) {
          console.error(err);
        }
      }

      req.session.message = {
        type: 'info',
        message: 'User deleted successfully!',
      };
      res.redirect('/');
    })
    .catch((err) => {
      res.json({ message: err.message, type: 'danger' });
    });
});

module.exports = router;
