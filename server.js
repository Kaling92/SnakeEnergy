const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve toàn bộ thư mục Project/public
app.use(express.static(path.join(__dirname, "Project", "public")));

// Root route → mở Login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Project", "public", "Login.html"));
});

// Mock user database
const users = [
  { username: "linh", password: "123456", token: "abc123" },
  { username: "admin", password: "adminpass", token: "xyz789" }
];

// Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ success: true, token: user.token });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Signup API
app.post("/api/signup", (req, res) => {
  const { username, password, fullName } = req.body;
  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const newUser = { username, password, fullName, token: Math.random().toString(36).substr(2, 9) };
  users.push(newUser);

  res.json({ success: true, message: "User created" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
