var Trending = require('./Trending.react');
var UserBox = require('./UserBox.react');

DiscoveryBox = React.createClass({

    render: function() {
        return (
        	<div>
                <UserBox/>
                <div style={{ height: 15 }}></div>
                <Trending/>
            </div>
    	);
    }
});

module.exports = DiscoveryBox;
