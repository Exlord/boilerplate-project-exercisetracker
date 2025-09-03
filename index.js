const express = require("express");
const bodyParser = require("body-parser");
const {randomUUID} = require("crypto");
const cors = require('cors')
require('dotenv').config()

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];

function formatDate(date) {
  return new Date(date).toDateString();
}

/**
 * POST /api/users
 * Create new user
 */
app.post("/api/users", (req, res) => {
  const {username} = req.body;
  if (!username) {
    return res.status(400).json({error: "Username is required"});
  }

  const newUser = {
    _id: randomUUID(),
    username,
    log: []
  };

  users.push(newUser);

  res.json({
    username: newUser.username,
    _id: newUser._id
  });
});

/**
 * GET /api/users
 * Get all users
 */
app.get("/api/users", (req, res) => {
  const result = users.map(u => ({
    username: u.username,
    _id: u._id
  }));
  res.json(result);
});

/**
 * POST /api/users/:_id/exercises
 * Add exercise to a user
 */
app.post("/api/users/:_id/exercises", (req, res) => {
  const {_id} = req.params;
  const {description, duration, date} = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({error: "User not found"});

  if (!description || !duration) {
    return res.status(400).json({error: "Description and duration are required"});
  }

  const exercise = {
    description: description,
    duration: Number(duration),
    date: date ? formatDate(date) : formatDate(new Date())
  };

  user.log.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

/**
 * GET /api/users/:_id/logs
 * Retrieve user logs
 */
app.get("/api/users/:_id/logs", (req, res) => {
  const {_id} = req.params;
  const {from, to, limit} = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({error: "User not found"});

  let log = [...user.log];

  // Apply filters
  if (from) {
    const fromDate = new Date(from);
    log = log.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, Number(limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
