var config = {};

config.shanbay = {
    api_version:        "1.0",
    api_root:           "https://api.shanbay.com",
    auth_url:           "/oauth2/authorize/",
    token_url:          "/oauth2/token/",
    auth_success_url:   "oauth2/auth/success/",
    client_id:          "ac0c52067dff084491bb",
    response_type:      "token",
    call_back:          "https://api.shanbay.com/oauth2/auth/success/",
    account_url:        "/account/",
    search_url:         "/bdc/search/",
};

module.exports = config;