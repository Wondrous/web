var Feed = require('./Feed.react');
var UserStore = require('../../stores/UserStore');

var Home = React.createClass({
    mixins: [Reflux.listenTo(UserStore,'onUserUpdate')],
    onUserUpdate: function(userData){
        this.forceUpdate();
    },
    render: function(){
        if (!UserStore.loaded){
            return (<div></div>);
        }

        return (
            <div>
                <Feed />
            </div>
        );
    }
});

module.exports = Home;