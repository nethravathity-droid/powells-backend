const mongoose = require("mongoose");

mongoose.connect("your_mongo_uri");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

async function showUsers() {
  const users = await User.find();
  console.log(users);
  mongoose.disconnect();
}

showUsers();
