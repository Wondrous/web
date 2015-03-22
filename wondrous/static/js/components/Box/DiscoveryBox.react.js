var Trending = require('./Trending.react');
var UserBox = require('./UserBox.react');

DiscoveryBox = React.createClass({

    render: function(){
        return (
        	<div>
                <Trending/>
                <UserBox/>
            </div>
    	);
    }
});

module.exports = DiscoveryBox;
