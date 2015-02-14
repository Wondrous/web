/* ============= OBJECT TAG VOTE ============== */
$(document).on('click', '.upvoteButton', function() {
    var thisPost = this;
    var objectID = $(thisPost).parents('.post-body').find('.objectID').val();

    objectVoteAjax(thisPost, objectID);
});

function objectVoteAjax(thisPost, objectID) {
    $.ajax({
        type: "POST",
        url: "/ajax/object_vote/",
        data: {'object_id': objectID},
        success: function(vote_data) {

            var totalUpvotes   = vote_data['total_upvotes'];
            var totalDownvotes = vote_data['total_downvotes'];
            var hasVoted       = vote_data['has_voted'];
            var upvotedCount   = vote_data['upvoted_count'];

            // Display posts's total votes
            $(thisPost).parents('.post-body').find('.totalUpvotes').text(totalUpvotes);
            $(thisPost).parents('.post-body').find('.totalDownvotes').text(totalDownvotes);

            // Make the hand icons the correct color
            if (hasVoted == 1) {
                $(thisPost).addClass('upvoted');
            } else {
                $(thisPost).removeClass('upvoted');
            }
        }
    });
}

/* ============= USER VOTE ============== */

VoteAction = {
    LIKED:0,
    BOOKMARKED:1,
    CANCEL:2,
    FOLLOW:3,
    ACCEPT:4,
    BLOCK:5,
    DENY:6,
    TOPFRIEND:7
};

// Favorite the user (2)
$(document).on('click', '#doubleUpvoteUserButton', function() {
    var thisButton = this;
    var profileID = $('#profileID').val();
    var voteType = VoteAction.TOPFRIEND;

    userVoteAjax(thisButton, voteType, profileID);
});

// Follow and unFollow (1 and 0)
// This also handles a followRequest. A 0 -> 1 indicats a request.
// The server side code will input an appropriate
// -1 to indicate the request.
$(document).on('click', '#upvoteUserButton', function() {
    var thisButton = this;
    var profileID = $('#profileID').val();
    var voteType = VoteAction.FOLLOW;
    userVoteAjax(thisButton, voteType, profileID);
});

// Accept a follow request
$(document).on('click', '#acceptFollowRequestButton', function() {
    var thisButton = this;
    var profileID = $('#profileID').val();
    var voteType = VoteAction.ACCEPT;

    userVoteAjax(thisButton, voteType, profileID);
});

// Deny a follow request
$(document).on('click', '#denyFollowRequestButton', function() {
    var thisButton = this;
    var profileID = $('#profileID').val();
    var voteType = VoteAction.DENY;

    userVoteAjax(thisButton, voteType, profileID);
});

// Block the user (-2)
$(document).on('click', '#doubleDownvoteUserButton', function() {
    var thisButton = this;
    var profileID = $('#profileID').val();
    var voteType = VoteAction.BLOCK;

    userVoteAjax(thisButton, voteType, profileID);
});

function userVoteAjax(thisButton, action, profileID) {
    console.log("voting with",action);
    $.ajax({
        type: "POST",
        url: '/api/user/vote/',
        data: {
            'user_id': profileID,
            'action':action,
            'vote_type':1
            },
        success: function(vote_data) {
            // TODO
            console.log(vote_data);
        }
    });
}
