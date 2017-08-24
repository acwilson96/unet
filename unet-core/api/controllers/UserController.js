/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var bcrypt = require('bcrypt');

 //get messages.
 const get_success_msg       = 'Logged In';
 const get_failure_msg       = 'Invalid username or password.';

 // create messages.
 const uname_regexp          = /^[a-zA-Z0-9_-]{3,26}$/
 const pword_regexp          = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,50})$/
 const uname_invalid_msg     = 'Username must be between 3 and 26 characters long, and can only contain alphanumerical, \'-\' and \'_\'';
 const pword_invalid_msg     = 'Password must contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';
 const user_exists_msg       = 'User already exists with that username.';
 const user_created_msg      = 'Succesfully Created Account';
 

module.exports = {

    /* 
     * 'post /unet/user/get'
     * Check if a user exists under post param "username". If not, creates a new one.
     * 
     * Returns json:
     * {
     *     err: [ true | false ],
     *     warning: [ true | false ],
     *     msg: Error or Warning message; E.G. [ 'Incorrect username or password' ]
     *     exists: [ true | false ],
     *     user: {
     *         username: 'string',
     *         id: 'integer'
     *     }
     * }
     *
     */
    get: function (req, res) {
        // Parse POST for User params.
        var uname = req.session.username;
        var pword = req.session.password;

        // Look up User.
        User.findOne({
            username: uname
        }).exec((err, user) => {
            if (err) return res.json(return_error(err));
            // Check Password matches database password.
            bcrypt.compare(pword, user.password, (err, match) => {
                if (err) return res.json(return_error(err));
                if (match) {
                    return res.json({
                        err: false,
                        warning: false,
                        msg: get_success_msg,
                        exists: true,
                        user: user
                    });
                } else {
                    return res.json({
                        err: false,
                        warning: true,
                        msg: get_failure_msg,
                        exists: null,
                        user: null
                    });
                }
            });
        });
    },

    /* 
     * 'post /unet/user/create'
     * Check if a user exists under post param "username". If not, creates a new one.
     * 
     * Returns json:
     * {
     *     err: [ true | false ],
     *     warning: [ true | false ],
     *     msg: Error or Warning message; E.G. [ 'User already exists' | 'Password must contain 1 uppercase' ]
     *     exists: [ true | false ],
     *     user: {
     *         username: 'string',
     *         id: 'integer'
     *     }
     * }
     *
     */
    create: function (req, res) {        
        // Parse POST for User params.
        var uname = req.params.username;
        var pword = req.params.password;

        // Check username is valid.
        if (uname.search(uname_regexp) == -1) {
            return res.json({
                err: false,
                warning: true,
                msg: uname_invalid_msg,
                exists: null,
                user: null
            });
        }

        // Check password is valid.
        if (pword.search(pword_regexp) == -1) {
            return res.json({
                err: false,
                warning: true,
                msg: pword_invalid_msg,
                exists: null,
                user: null
            })
        }

        // Check if a User exists under this username already.
        User.findOne({
            username: uname
        }).exec((err, user) => {
            // Error; return error to client app.
            if (err) return res.json(return_error(err));
            // If the user exists.
            if (user) {
                return res.json({
                    err: false,
                    warning: true,
                    msg: user_exists_message,
                    exists: true,
                    user: null
                });
            } else {
                bcrypt.hash(pword, 10, (err, hash) => {
                    User.create({
                        username: uname,
                        password: hash
                    }).exec((err, user) => {
                        // Error; return error to client app.
                        if (err) return res.json(return_error(err));
                        return res.json({
                            err: false,
                            warning: false,
                            msg: user_created_msg,
                            exists: false,
                            username: user.username,
                            id: user.id
                        });
                    });
                });
            }
        });
    },

    destroy: function (req, res) {

    },

    update: function (req, res) {

    }
	
};

function return_error(err) {
    return {
        err: true,
        warning: false,
        msg: err,
        exists: null,
        user: null
    }
}