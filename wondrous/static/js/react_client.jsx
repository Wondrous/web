var TutorialBox = React.createClass({
    render: function(){
        return (
            <div className='tutorial'>
                <div className="tutorial-content-wrapper">
                    <h2 className="tutorial-header"><b>Welcome to Wondrous.</b> We're excited to have you on board!</h2>
                    <div className="tutorial-content">Here's a quick "tutorial" to get you up to speed:</div>
                    <div className="tutorial-finish-btn round-3">Okay, I got it.</div>
                </div>
            </div>
        );
    }
});

var ProfileIcon = React.createClass({
    render: function(){
        this.props = this.props.data
        this.props.my_href = '/'+this.props.username.toString();
        return (
            <a id="linkToProfile" href={this.props.my_href} className="general-text banner-user-name">
            <img className="banner-user-img round-3" src={this.props.profile_picture}/>
            {this.props.first_name}
            </a>
        );
    }
});

function getMyInfo() {
    $.ajax({
        type: "POST",
        url: "/ajax/my_info/",
        success: function(data) {
            console.log(data);
            // $('#query').value(data.query);
            if (data.show_tutorial){
                React.render(
                    <TutorialBox />,
                    document.getElementById('tutorial-wrapper')
                );
            }
            React.render(
                <ProfileIcon data={data}/>,
                document.getElementById('profileIcon')
            );
        }
    });
}

getMyInfo();
