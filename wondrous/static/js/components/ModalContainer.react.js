var ReportModal = require('./Modals/ReportModal.react');
var SignupModal = require('./Modals/SignupModal.react');
var PostModal = require('./Modals/PostModal.react');
var LikedUserModal = require('./Modals/LikedUserModal.react');
var PostFormModal = require('./Modals/PostFormModal.react');

var ModalContainer = React.createClass({
    // WARNING: ordering does matter!
    render: function(){
        return (
            <div>
                <PostModal/>
                <PostFormModal/>
                <SignupModal/>
                <LikedUserModal/>
                <ReportModal/>
            </div>
            );
    }
});

module.exports = ModalContainer;
