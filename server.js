const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const app = express();
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "marionette",
    database: "smart"
  }
});

// db.select("*")
//   .from("users")
//   .then(data => {
//     console.log(data);
//   });

app.use(bodyParser.json());
app.use(cors());

const database = {
  users: [
    {
      id: "123",
      name: "Jon Snow",
      password: "cookies",
      email: "jon@gmail.com",
      entries: 0,
      joined: new Date()
    },
    {
      id: "124",
      name: "Jorah Mormont",
      password: "myqueen",
      email: "jorah@gmail.com",
      entries: 0,
      joined: new Date()
    }
  ],
  login: [
    {
      id: "987",
      hash: "",
      email: "jon@gmail.com"
    }
  ]
};

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  if (
    req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password
  ) {
    // res.json("success");
    return res.json(database.users[0]);
  } else {
    return res.status(400).json("Something went wrong");
  }
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({
      id: id
    })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not Found");
      }
    })
    .catch(err => res.status(400).json("Error getting user"));
});

app.post("/register", (req, res) => {
  const { email, name } = req.body;
  db("users")
    .returning("*")
    .insert({
      email: email,
      name: name,
      joined: new Date()
    })
    .then(user => {
      res.json(user[0]);
    })
    .catch(err => res.status(400).json("Something went wrong here..."));
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
      Res.json(entries[0]);
    })
    .catch(err => res.status(400).json("Unable to get entries"));
});

app.listen(4000, () => {
  console.log("I'm listening");
});
