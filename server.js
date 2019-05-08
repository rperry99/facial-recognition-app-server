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

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .where("email", "=", req.body.email)
    .from("login")
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => res.status(400).json("Unable to get user"));
      } else {
        res.status(400).json("Wrong Credentials");
      }
    })
    .catch(err => res.status(400).json("Wrong Credentials"));
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
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into("login")
      .returning("email")
      .then(loginEmail => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => res.status(400).json("Something went wrong here..."));
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json("Unable to get entries"));
});

app.listen(4000, () => {
  console.log("I'm listening");
});
