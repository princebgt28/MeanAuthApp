var express = require('express');
// var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
const User = require('../models/user');

const auth_ids = require('../soc_key/auth_key');


module.exports = function (passport) {
  // OAuth 2.0-based strategies require a `verify` function which receives the
  // credential (`accessToken`) for accessing the Facebook API on the user's
  // behalf, along with the user's profile.  The function must invoke `cb`
  // with a user object, which will be set at `req.user` in route handlers after
  // authentication.
  console.log("In passport fn");
  passport.use(new Strategy({
    clientID: auth_ids.facebook.clientID,
    clientSecret: auth_ids.facebook.clientSecret,
    callbackURL: 'http://localhost:3000/users/fbreturn',
    profileFields: ['id', 'displayName', 'email']
  },
    function (accessToken, refreshToken, profile, cb) {
      // In this example, the user's Facebook profile is supplied as the user
      // record.  In a production-quality application, the Facebook profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.

      // console.log("Profile==");
      // console.log(profile._json);
      const userId = profile._json.id;
      //verifying info from facebook=============================================
      User.getUserByFbUserId(userId, (err, user) => {
        if (err) throw err;
        // console.log(user);
        if (!user) {
          console.log("Yay! Got another new user !! ==========================");
          let newUser = new User({
            name: profile._json.name,
            email: profile._json.email,
            username: "undefined",
            password: "undefined",
            fbuserid: profile._json.id
          });
          console.log('------------------------------NEW USER-----------------------')
          console.log(newUser);
          // return res.json({ success: false, msg: 'User not found' });
          User.addFbUser(newUser, (err, user) => {
            if (err) {
              console.log("Failed to regFBuser" + err);
              // res.json({ success: false, msg: 'Failed to register user' });
            } else {
              console.log("FBuser registered" + err);
              // res.json({ success: true, msg: 'User registered' });
            }
          });
        }
        else {
          console.log("Dude! You have already registered !! ==========================");
        }
      });
      return cb(null, profile);
    }));

  console.log("###==");

  // serialize and deserialize
  passport.serializeUser(function (user, done) {
    console.log(user);
    done(null, user);
  });
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });
}
