var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');
var PostStore = require('../../stores/PostStore');

var LikedUserModal = React.createClass({
    mixins:[Reflux.listenTo(ModalStore,"onModalChange"),Reflux.listenTo(PostStore,"onPostChange")],
    handleClose: function(){
        WondrousActions.closeLikedUserModal();
    },

    getInitialState: function(){
        return {users:[]}
    },

    onModalChange: function(stuff) {
        this.forceUpdate();
    },

    onPostChange: function(postUpdate) {
        if(typeof postUpdate!=='undefined' && postUpdate.hasOwnProperty('likedUsers')){
            this.setState({users:postUpdate.likedUsers})
        }
    },

    stopProp: function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
    },

    loadMore: function(){
        PostStore.loadMoreLikedUsers();
    },
    handleClick: function(evt){
        ModalStore.clearModal();
    },
    render: function(){
        divStyle = ModalStore.likedUserOpen?{display:"block"} : {display:"none"};

        var users = this.state.users.map(function(user,ind){
            return (
                <Link key={ind} to={'/'+user.username} onClick={this.handleClick} className="dropdown-a">
                    <div className="dropdown-element dropdown-element-notification">
                        <span className="notificationTextPosition">
                            <img ref="usericon" className="post-thumb round-2" src={"http://mojorankdev.s3.amazonaws.com/"+user.ouuid} />
                            <div className="notification-content">
                                <div>
                                    <b>{user.name}
                                    </b>
                                </div>
                            </div>
                        </span>
                    </div>
                </Link>
            );
        },this);

		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div className="vertical-center">
						<div className="modal-wrapper">
                            <div onClick={this.stopProp} className="modal round-5">
                                <h5 className="notification-menu-header">Users Who liked this</h5>
                                {users}
                                {!PostStore.doneLikedUserPaging?<button onClick={this.loadMore}>Load More</button>:{}}
                            </div>
						</div>

					</div>
				</div>

			</div>
		);
    }
});


module.exports = LikedUserModal;
