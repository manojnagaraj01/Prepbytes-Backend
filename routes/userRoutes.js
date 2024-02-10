const route = require("express").Router()
const {signup, signin, createCheckOutSession} = require("../controllers/userController")


route.post("/signup", signup)
route.post("/signin", signin)
route.post('/create-checkout-session',createCheckOutSession)
// route.post("/create-checkout-session", checkout)
// route.post("/getCourseOfUser", offer)
// route.post("/sendEnquiry", enquiryform)
// route.get("/order/success", order)
module.exports = route;