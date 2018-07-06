'use strict';

module.exports = function(app) {
    let Servives = require('../controllers/serviceController');
    let Wallet = require('../controllers/walletController');
    let Membership = require('../controllers/membershipController');
    let Appointment = require('../controllers/appointmentController');
    let Admin = require('../controllers/adminController');
    let Inquiry = require('../controllers/inquiryController');
    let CommentSVProvider = require('../controllers/commentSVProviderController');
    let ServiceComment = require('../controllers/serviceCommentController');
    let Banner = require('../controllers/bannerAdsDisplaysController');
    let fullPage = require('../controllers/fullpageAdsDisplaysController');
    let classified = require('../controllers/classifiedAdsDisplayController');
    let requirement = require('../controllers/requirementController');
    let auction = require('../controllers/auctionController');

    // todoList Routes
    //http://localhost:4000/api/appointment/5aa0ef6d42e9261518c75b7c/1
    app.route('/api/requirement')
        .post(requirement.insert_requiriment_file);
    app.route('/api/auction')
        .post(auction.serivce_provider_send_auction);
    app.route('/api/appointment/:account_id/:page')
        .get(Appointment.list_all_appointment);
    app.route('/api/appointment/:id')
        .put(Appointment.update_appointment);
    app.route('/api/appointment')
        .post(Appointment.insert_book_appointment);
    app.route('/api/appointment/file')
        .post(Appointment.insert_book_appointment_file);
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
    app.route('/api/admin-info')
        .get(Admin.get_admin)
        .post(Admin.insert_admin);
    app.route('/api/inquiry')
        .post(Inquiry.insert_inquiry);
    app.route('/api/inquiry/:id')
        .get(Inquiry.get_inquiry_one_id);
    app.route('/api/inquiry/list')
        .post(Inquiry.get_inquiry_list_user_id);
    app.route('/api/inquiry/service')
        .post(Inquiry.get_inquiry_service_consumer);
    app.route('/service_provider_comment/create')
        .post(CommentSVProvider.insert_comment_provider);
    app.route('/api/comment-services')
        .post(ServiceComment.insert_comment_service);
    app.route('/api/comment-services/:services_id')
        .get(ServiceComment.get_comment_service_consumer);
    app.route('/api/banner-ads-displays')
        .get(Banner.get_banner_price)
        .post(Banner.insert_banner_ads);
    app.route('/api/full-page-ads-displays')
        .get(fullPage.get_full_page_price)
        .post(fullPage.insert_full_page_ads);
    app.route('/api/classified-ads-displays')
        .get(classified.get_classified_price)
        .post(classified.insert_classified_ads);
};
