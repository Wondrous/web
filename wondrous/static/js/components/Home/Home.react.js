var Feed = require('./Feed.react');
var UserStore = require('../../stores/UserStore');
var ModalStore = require('../../stores/ModalStore');
var LandingApp = require('../Landing.react');

var Home = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    mixins: [Reflux.listenTo(UserStore,'onUserUpdate'), Reflux.listenTo(ModalStore,'onModalUpdate')],

    onUserUpdate: function(userData){
        this.forceUpdate();
    },

    onModalUpdate: function(userData){
        this.forceUpdate();
    },

    render: function(){
        if(!UserStore.loaded){
            return (
                <div></div>
            );
        }

        if(!UserStore.loggedIn&&UserStore.loaded&&(typeof this.context.router.getCurrentParams().post_id === 'undefined')){
            return (
                <div>
                    <LandingApp />
                </div>
            );
        }

        return (
            <div>
                <Feed />
            </div>
        );
    }
});

module.exports = Home;
