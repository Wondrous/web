var StatusBar = React.createClass({
    render: function(){
        return (
            <div className="post-subject-text-position">
                <div>
                    {this.props.data.subject}
                </div>
                <div className="post-text-preview">
                    {this.props.data.textPreview}
                </div>
                <span className="post-micro-data-super-analytics-item">
                    <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/view/eye_gray_shadow.svg" className="post-general-icon post-view-icon" />
                    {this.props.data.view_count}
                </span>

                <span className="post-micro-data-super-analytics-item">
                    <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/comment/cloud_gray_shadow.svg" className="post-general-icon post-comment-icon" />
                    {this.props.data.comment_count}
                </span>

                <span className="post-micro-data-super-analytics-item">
                    {this.props.data.liked ?
                        <span>
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_red.svg" className="post-general-icon post-like-icon postHeartIcon" />
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_gray_shadow.svg" className="post-general-icon post-like-icon postHeartIcon" style={{ display: "none" }} />
                        </span>
                        :
                        <span>
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_red.svg" className="post-general-icon post-like-icon postHeartIcon" style={{ display: "none" }} />
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_gray_shadow.svg" className="post-general-icon post-like-icon postHeartIcon" />
                        </span>
                    }
                    {this.props.data.like_count}
                </span>
            </div>
        );
    }
});


module.exports = StatusBar;
