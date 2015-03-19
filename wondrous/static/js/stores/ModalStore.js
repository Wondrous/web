var WondrousActions = require('../actions/WondrousActions');
var WondrousConstants = require('../constants/WondrousConstants');

var ModalStore = Reflux.createStore({
    listenables: WondrousActions,

    init: function() {
        this.unloadUser();
    },

    unloadUser: function() {
        this.reportType = null;
        this.reportId = null;
        this.modalType = null;

        this.signupOpen = false;
        this.postFormOpen = false;
        this.cardOpen = false;
        this.likedUserOpen = false;

        this.reportSubmitted = false;
    },

    openCardModal: function() {
        if (this.cardOpen != true){
            this.cardOpen = true;
            $('body').addClass('modal-open');
            this.trigger();
        }
    },

    closeCardModal: function() {
        if (this.cardOpen != false) {
            this.cardOpen = false;
            $('body').removeClass('modal-open');
            this.trigger();
        }
    },

    openLikedUserModal: function() {
        if (this.likedUserOpen != true){
            this.likedUserOpen = true;
            $('body').addClass('modal-open');
            this.trigger();
        }
    },

    closeLikedUserModal: function() {
        if (this.likedUserOpen != false) {
            this.likedUserOpen = false;
            $('body').removeClass('modal-open');
            this.trigger();
        }
    },
    toggleModal: function(){
        if($('body').hasClass('modal-open')){
            this.modalType = null;
            $('body').removeClass('modal-open');
        }else{
            $('body').addClass('modal-open');
        }
    },

    togglePictureModal: function() {
        this.modalType = WondrousConstants.MODALTYPE_PICTURE;
        this.postFormOpen = !this.postFormOpen;
        this.toggleModal();
        this.trigger();
    },

    togglePostModal: function() {
        this.modalType = WondrousConstants.MODALTYPE_POST;
        this.postFormOpen = !this.postFormOpen;
        this.toggleModal();
        this.trigger();
    },

    toggleCommentReport: function(item_id) {
        if (this.reportType == null) {
            this.reportType = "comment";
            this.reportId = item_id;
            $('body').addClass('modal-open');
        } else {
            this.reportType = null;
            this.reportId = null;
            $('body').removeClass('modal-open');
        }
        this.trigger();
    },

    togglePostReport: function(item_id) {
        if (this.reportType == null) {
            this.reportType = "post";
            this.reportId = item_id;
            $('body').addClass('modal-open');
        } else {
            this.reportType = null;
            this.reportId = null;
            $('body').removeClass('modal-open');
        }
        this.trigger();
    },
    reportReceived: function(){
        this.reportSubmitted = true;
        var that = this;
        setTimeout(function(){that.reportSubmitted=false},1000);
        this.trigger();
    },
    closeSignupPrompt: function() {
        if (this.signupOpen == true) {
            this.signupOpen = false;
            this.trigger();
            $('body').removeClass('modal-open');
        }
    },

    openSignupPrompt: function() {
        if (this.signupOpen != true){
            this.signupOpen = true;
            this.trigger();
            $('body').addClass('modal-open');
        }
    },

    clearModal: function() {
        while ($('body').hasClass('modal-open')) {
            $('body').removeClass('modal-open');
        }
        this.unloadUser();
        this.trigger();
    }
});


module.exports = ModalStore;
