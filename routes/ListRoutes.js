'use strict';

module.exports = function(app) {
    let Servives = require('../controllers/serviceController');

    // todoList Routes
    app.route('/api/service/all')
        .get(Servives.list_all_services);
    app.route('/api/service/topbuy/:page')
        .get(Servives.list_all_top_buy_services);
};
