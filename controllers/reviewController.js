const reviewModel = require('../models/review-model');

const reviewController = {}
reviewController.addReview = async (req, res, next) => {
  try {
    const { item_id, rating, comment } = req.body;
    console.log('form data:', req.body)// try to see what data is parsed

    const user_id = req.user ? req.user.account_id : null // Assume authentication middleware provides this
    console.log("user_id is:", user_id)// check if user_id is returned.

    /*// Validation
    if (rating < 1 || rating > 5) {
      return res.status(400).send('Rating must be between 1 and 5.');
    }*/
   if (user_id) {
    await reviewModel.addReview(user_id, item_id, rating, comment);
    res.redirect(`/inventory/details/${item_id}`)
   } else {
    res.redirect("/login")
   }

  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding review.');
  }
}

module.exports = reviewController
