var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication, check_authorization } = require('../Utils/check_auth');

router.post('/signup', async function(req, res, next) {
    try {
        let body = req.body;
        let result = await userController.createUser(
          body.username,
          body.password,
          body.email,
         'user'
        )
        res.status(200).send({
          success:true,
          data:result
        })
      } catch (error) {
        next(error);
      }

})
router.post('/login', async function(req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let result = await userController.checkLogin(username,password);
        res.status(200).send({
            success:true,
            data:result
        })
      } catch (error) {
        next(error);
      }

})
router.get('/me',check_authentication, async function(req, res, next){
    try {
      res.status(200).send({
        success:true,
        data:req.user
    })
    } catch (error) {
        next();
    }
})

router.get('/resetPassword/:id', check_authentication, check_authorization(['admin']), async function(req, res, next) {
  try {
      let userId = req.params.id;
      let user = await userController.getUserById(userId);
      if (user) {
          user.password = '123456';
          await user.save();
          res.status(200).send({
              success: true,
              message: 'Password has been reset to 123456'
          });
      } else {
          throw new Error('User not found');
      }
  } catch (error) {
      next(error);
  }
});

router.post('/changePassword', check_authentication, async function(req, res, next) {
  try {
    let userId = req.user.id;
    let { currentPassword, newPassword } = req.body;
    let user = await userController.getUserById(userId);

    if (user && await userController.checkPassword(user, currentPassword)) {
      user.password = newPassword;
      await user.save();
      res.status(200).send({
        success: true,
        message: 'Password has been changed successfully'
      });
    } else {
      res.status(400).send({
        success: false,
        message: 'Current password is incorrect'
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router