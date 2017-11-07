const express = require('express');
const session = require('express-session');

const passport = require('passport');
const strategy = require('./strategy.js');
const request = require('request');

var nicknameUrl = "";

const app = express();
app.use( session({
  secret: 'I do what I want',
  resave: false,
  saveUninitialized: false
}));

app.use( passport.initialize() );
app.use( passport.session() );
passport.use( strategy );

passport.serializeUser( (user, done) => {
  const { clientID, email, name, followers_url: followers } = user._json;
  nicknameUrl = user._json.nickname;
  done(null, {clientID, email, name, followers});
});

passport.deserializeUser( (obj, done) => {
  done(null, obj);
});

app.get('/login',
  passport.authenticate('auth0',
    {successRedirect: '/followers', failureRedirect: '/login', failureRedirect: true, connection: 'github'}
  )
);

app.get('/followers', (req, res, next) => {
  if (!req.user) {
    res.redirect('/login');
  } else {
    var getFollowers = {
      url: `https://api.github.com/users/${nicknameUrl}/followers`,
      headers: {
        'User-Agent': 'request'
      }
    };

    request(getFollowers, (error, response, body) => {
      res.status(200).send(body);
    })
  }
}
)
const port = 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}`); } );
