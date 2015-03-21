var Feed = require('./Feed.react');
var UserStore = require('../../stores/UserStore');
var DiscoveryBox = require('../Box/DiscoveryBox.react');

var Home = React.createClass({
    mixins: [Reflux.listenTo(UserStore,'onUserUpdate')],
    
    onUserUpdate: function(userData){
        this.forceUpdate();
    },
    render: function(){
        return (
            <div>
                <DiscoveryBox />
                <Feed />
            </div>
        );
    }
});

module.exports = Home;
