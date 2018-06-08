'use strict';

module.exports = function(app) {
    let Servives = require('../controllers/serviceController');
    let Wallet = require('../controllers/walletController');
    let Membership = require('../controllers/membershipController');
    let Appointment = require('../controllers/appointmentController');
    // todoList Routes
    //http://localhost:4000/api/appointment/5aa0ef6d42e9261518c75b7c/1
    app.route('/api/appointment/:account_id/:page')
        .get(Appointment.list_all_appointment);
    app.route('/api/service/all')
        .get(Servives.list_all_services);
    //{page, provider_id}
    //http://120.72.107.187:4000/api/service/provider
    app.route('/api/service/provider')
        .post(Servives.list_service_follow_provider);
    app.route('/api/service/topbuy/:page')
        .get(Servives.list_all_top_buy_services);
    app.route('/api/service/topcomment/:page')
        .get(Servives.list_all_top_comment_services);
    app.route('/api/service/topmembership/:page')
        .get(Servives.list_all_top_membership_services);
    app.route('/api/service/new/:page')
        .get(Servives.list_all_services_new);
    app.route('/api/service/sale/:page')
        .get(Servives.list_all_services_sale);
    app.route('/api/wallet/delete_trash')
        .get(Wallet.delete_wallet_trash);
    app.route('/update_balance')
        .post(Wallet.update_wallet);
    app.route('/wallet/balance/:user_id')
        .get(Wallet.get_wallet);
    app.route('/api/membership/change')
        .post(Membership.change_member_ship);
    app.route('/api/membership/price')
        .get(Membership.get_price_member_ship)
        .post(Membership.get_price_chang_member_ship);
};
