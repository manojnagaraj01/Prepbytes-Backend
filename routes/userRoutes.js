const route = require("express").Router()
const {signup, signin} = require("../controllers/userController")


route.post("/signup", signup)
route.post("/signin", signin)

module.exports = route