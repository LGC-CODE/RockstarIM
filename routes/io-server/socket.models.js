var mongoose = require("mongoose");
var userModel = mongoose.model('LogUser');
var jwt = require('jsonwebtoken');
var models = {};

models.getNotifications = (user)=>{
    user(userModel);
};

module.exports = models;