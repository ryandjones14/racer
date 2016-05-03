// config/auth.js
var twitterKey = process.env.XPLORR_TWITTER_KEY;
var twitterSecret = process.env.XPLORR_TWITTER_SECRET;
var twitterCallbackUrl = process.env.XPLORR_CALLBACK;
// expose our config directly to our application using module.exports
module.exports = {

    'twitterAuth' : {
        'consumerKey'       : twitterKey,
        'consumerSecret'    : twitterSecret,
        'callbackURL'       : twitterCallbackUrl
    },

};
