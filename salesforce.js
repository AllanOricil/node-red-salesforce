module.exports = function(RED) {
    "use strict";
    var jsforce = require('jsforce');

    var localUserCache = {};
    var userObjectCache = {};
    var userSreenNameToIdCache = {};

    function SalesforceConnectionNode(config) {
        RED.nodes.createNode(this, config);
        if (this.credentials.username &&
            this.credentials.password &&
            this.credentials.connectedAppClientId &&
            this.credentials.connectedAppClientSecret) {

            this.oauth = {
                loginUrl: this.credentials.instanceUrl,
                clientId: this.credentials.connectedAppClientId,
                clientSecret: this.credentials.connectedAppClientSecret,
            }

            this.connection = new jsforce.Connection({
                oauth2: this.oauth
            });

            var self = this;

            this.connection.login(this.credentials.username, this.credentials.password, function(err, userInfo) {
                console.log(self.connection.accessToken);
                console.log(self.connection.instanceUrl);
                console.log("User ID: " + userInfo.id);
                console.log("Org ID: " + userInfo.organizationId);
            });
        }
    }

    RED.nodes.registerType("salesforce-connection", SalesforceConnectionNode,{
        connection: {
            username: { type: "text" },
            password: { type: "password" },
            connected_app_client_id: { type: "password" },
            connected_app_client_secret: { type:"password" }
        }
    });
    
    TwitterCredentialsNode.prototype.get = function(url, opts) {
        var node = this;
        opts = opts || {};
        opts.tweet_mode = 'extended';
        return new Promise(function(resolve,reject) {
            request.get({
                url: url,
                oauth: node.oauth,
                json: true,
                qs: opts
            }, function(err, response,body) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        status: response.statusCode,
                        rateLimitRemaining: response.headers['x-rate-limit-remaining'],
                        rateLimitTimeout: 5000+parseInt(response.headers['x-rate-limit-reset'])*1000 - Date.now(),
                        body: body
                    });
                }
            });
        })
    }

    TwitterCredentialsNode.prototype.post = function(url, data, opts, formData) {
        var node = this;
        opts = opts || {};
        var options = {
            url: url,
            oauth: node.oauth,
            json: true,
            qs: opts,
        };
        if (data) {
            options.body = data;
        }
        if (formData) {
            options.formData = formData;
        }
        return new Promise(function(resolve,reject) {
            request.post(options, function(err, response,body) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        status: response.statusCode,
                        rateLimitRemaining: response.headers['x-rate-limit-remaining'],
                        rateLimitTimeout: 5000+parseInt(response.headers['x-rate-limit-reset'])*1000 - Date.now(),
                        body: body
                    });
                }
            });
        })
    }

    TwitterCredentialsNode.prototype.getUsers = function(users, getBy) {
        if (users.length === 0) {
            return Promise.resolve();
        }
        var params = {};
        params[getBy||"user_id"] = users;

        return this.get("https://api.twitter.com/1.1/users/lookup.json",params).then(function(result) {
            var res = result.body;
            if (res.errors) {
                throw new Error(res.errors[0].message);
            }
            res.forEach(user => {
                userObjectCache[user.id_str] = user
                userSreenNameToIdCache[user.screen_name] = user.id_str;
            });
        })
    }

}
