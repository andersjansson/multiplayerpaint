
var LocalStrategy  = require('passport-local').Strategy;
var User = require('../models/user');
var configAuth = require('./auth'); 
var bodyParser   = require('body-parser');
var validator = require('validator');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
       
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        if (validator.isEmail(email) || validator.isNull(email)){
            email = email.toLowerCase();
        }    
        else {
            return done(null, false, req.flash('loginMessage', 'Invalid email'));
        }
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
               
                if (err)
                    return done(err);

                if (!user || !user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'That did not match, try again.'));
                else
                    return done(null, user);
            });
        });

    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        if (validator.isEmail(email)){
            email = email.toLowerCase();

        }    
        else {
            console.log(password);
            console.log(email);
            console.log(validator.isEmail(email));
            return done(null, false, req.flash('signupMessage', 'Invalid email!'));
        }

        process.nextTick(function() {
            
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    
                    if (err)
                        return done(err);

                    
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        
                        var newUser = new User();

                        newUser.local.email = validator.escape(email);
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
           
            } else if ( !req.user.local.email ) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                    } else {
                        var user = req.user;
                        user.local.email = validator.escape(email);
                        user.local.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,user);
                        });
                    }
                });
            } else {
                return done(null, req.user);
            }

        });

    }));
};