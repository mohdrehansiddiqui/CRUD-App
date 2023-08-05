const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");


const app = express();
const PORT = process.env.PORT || 4000;

const mongoDBurl =
  "mongodb+srv://rehgraphicstudio08august:mongorehan123@cluster0.pcycpph.mongodb.net/maindb?retryWrites=true&w=majority";

mongoose.connect(mongoDBurl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

app.set("view enigine", "ejs");

app.use("", require("./routes/routes"));

// app.get("/", (req, res) => {
//   res.send("hello world");
// });

app.listen(PORT, () => {
  console.log(`server started at: http://localhost:${PORT}`);
});
