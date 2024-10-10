/*This is where the logic of the application happens. This folder controller
 will hold all logic of the application
*/
const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  /* ****
  * This displays flash message for session, it worked.
  * req.flash("notice", "This is a flash message.")
  * ******** */
  res.render("index", {title: "Home", nav})
}

module.exports = baseController