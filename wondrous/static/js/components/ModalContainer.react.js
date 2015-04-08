var ReportModal = require('./Modals/ReportModal.react');
var SignupModal = require('./Modals/SignupModal.react');
var PostModal = require('./Modals/PostModal.react');
var LikedUserModal = require('./Modals/LikedUserModal.react');
var PostFormModal = require('./Modals/PostFormModal.react');
var PictureFormModal = require('./Modals/PictureFormModal.react');
var DialogueModal = require('./Modals/DialogueModal.react');

var ModalContainer = React.createClass({
    // WARNING: ordering does matter!
    render: function(){
        return (
            <div>
                <PostModal/>
                <PostFormModal/>
                <PictureFormModal/>
                <SignupModal/>
                <LikedUserModal/>
                <ReportModal/>
                <DialogueModal/>
            </div>
            );
    }
});

module.exports = ModalContainer;
