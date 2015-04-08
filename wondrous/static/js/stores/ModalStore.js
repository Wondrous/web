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
        this.pictureFormOpen = false;
        this.cardOpen = false;
        this.likedUserOpen = false;

        this.dialogueOpen = false;
        this.dialogueType = null;
        this.dialogueMessage = null;
        this.dialogueAccept = false;

        this.reportSubmitted = false;

    },

    getModalState: function(){
        return {
            reportType:this.reportType,
            reportId:this.reportId,
            modalType: this.modalType,
            signupOpen: this.signupOpen,
            postFormOpen: this.postFormOpen,
            pictureFormOpen: this.pictureFormOpen,
            cardOpen: this.cardOpen,
            likedUserOpen:this.likedUserOpen,
            dialogueOpen: this.dialogueOpen,
            dialogueMessage: this.dialogueMessage,
            dialogueAccept: this.dialogueAccept,
            dialogueType: this.dialogueType,
            reportSubmitted: this.reportSubmitted
        }
    },
    openDialogue: function(message,type){
        if (this.dialogueOpen != true){
            this.dialogueOpen = true;
            this.dialogueType = type;
            this.dialogueMessage = message; 
            $('body').addClass('modal-open');
            this.trigger(this.getModalState());
        }
    },
    cancelDialogue: function(){
        if (this.dialogueOpen != false) {
            this.dialogueOpen = false;
            $('body').removeClass('modal-open');
            this.trigger(this.getModalState());
        }
    },
    acceptDialogue: function(message,type){
        if (this.dialogueOpen != false) {
            this.dialogueOpen = false;
            this.dialogueAccept = true;
            $('body').removeClass('modal-open');
            this.trigger(this.getModalState());
        }
    },
    openCardModal: function() {
        if (this.cardOpen != true){
            this.cardOpen = true;
            $('body').addClass('modal-open');
            this.trigger(this.getModalState());
        }
    },

    closeCardModal: function() {
        if (this.cardOpen != false) {
            this.cardOpen = false;
            $('body').removeClass('modal-open');
            this.trigger(this.getModalState());
        }
    },

    openLikedUserModal: function() {
        if (this.likedUserOpen != true){
            this.likedUserOpen = true;
            $('body').addClass('modal-open');
            this.trigger(this.getModalState());
        }
    },

    closeLikedUserModal: function() {
        if (this.likedUserOpen != false) {
            this.likedUserOpen = false;
            $('body').removeClass('modal-open');
            this.trigger(this.getModalState());
        }
    },
    toggleModal: function(val){
        if(val && !$('body').hasClass('modal-open')){
            $('body').addClass('modal-open');
        }else if(!val){
            $('body').removeClass('modal-open');
        }
    },

    openPictureModal: function() {
        this.pictureFormOpen = true;
        this.toggleModal(true);
        this.trigger(this.getModalState());
    },

    closePictureModal: function() {
        this.pictureFormOpen = false;
        this.toggleModal(false);
        this.trigger(this.getModalState());
    },

    openPostModal: function() {
        this.postFormOpen = true;
        this.toggleModal(true);
        this.trigger(this.getModalState());
    },

    closePostModal: function() {
        this.postFormOpen = false;
        this.toggleModal(false);
        this.trigger(this.getModalState());
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
        this.trigger(this.getModalState());
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
        this.trigger(this.getModalState());
    },

    reportReceived: function(){
        this.reportSubmitted = true;
        var that = this;
        setTimeout(function(){that.reportSubmitted=false},1000);
        this.trigger(this.getModalState());
    },

    closeSignupPrompt: function() {
        if (this.signupOpen == true) {
            this.signupOpen = false;
            this.trigger(this.getModalState());
            $('body').removeClass('modal-open');
        }
    },

    openSignupPrompt: function() {
        if (this.signupOpen != true){
            this.signupOpen = true;
            this.trigger(this.getModalState());
            $('body').addClass('modal-open');
        }
    },

    clearModal: function() {
        while ($('body').hasClass('modal-open')) {
            $('body').removeClass('modal-open');
        }
        this.unloadUser();
        this.trigger(this.getModalState());
    }
});


module.exports = ModalStore;
