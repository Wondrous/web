# web
This is the core web platform for Wondrous.

### API Documentation

#### Change User Relationships
```
LOGIN REQUIRED
 POST -> '/api/user/vote/'
 ```
 This API is used to change the relationship between the user logged in and the user requested. The following take displays the universal VoteAction table. The first three items: UNLIKED, LIKED, and BOOKMARKED are reserved for posts **ONLY**. Also note that the FOLLOW action acts as a toggle between followed and unfollowed.  
 ```javascript
 VoteAction = {
    UNLIKED:0,
    LIKED:1,
    BOOKMARKED:2,
    CANCEL:3,
    FOLLOW:4,
    ACCEPT:5,
    BLOCK:6,
    DENY:7,
    TOPFRIEND:8
};

 $.ajax({
        type: "POST",
        url: '/api/user/vote/',
        data: {
            'user_id': profileID,
            'action':VoteAction.FOLLOW //let's issue an follow
            },
        success: function(vote_data) {

        }
    });
```

#### Get User Information

```
 GET -> '/api/user/{username}/'
```
This will load a single JSON object that represents the user profile information.

```javascript
$.ajax({
       type: "GET",
       url: '/api/user/dude123/',
       success: function(user_data) {

       }
   });

```

#### Get User Wall
```
 Post -> '/api/wall/{username}/'
 ```

 This will load all the posts by {username}. Since this is not a constant time DB operation, pagination will be used. **start** will dictate the offset in the query. By default, results will be returned from the newest to the oldest by creation date.

```javascript
$.ajax({
       type: "POST",
       url: '/api/wall/dude123/',
       data: {
           'start':0
       },
       success: function(user_post_data) {

       }
   });
```

#### Create New Post
```
 POST -> '/api/wall/'
 ```

 This will create a new post to the server, will return the newly created post json object.
```javascript
$.ajax({
       type: "POST",
       url: '/api/wall/',
       data: {
           'subject': 'something intellectual',
           'text':'elaborate on something intellectual',
           'tags':['such','smart','wow','much','knowledge']
       },
       success: function(wall_posts) {

       }
   });
```

#### Get Majority Feed
```
 LOGIN REQUIRED
 POST ->  '/api/feed/'
 ```
 This will generate the majority feed based on the logged in user. Paginated by 15. It returns an array of post objects.
```javascript
$.ajax({
       type: "POST",
       url: '/api/feed/',
       data: {
           'start':0
       },
       success: function(feed_posts) {

       }
   });
```
### Installation
```
brew install pkg-config libffi;
export PKG_CONFIG_PATH=/usr/local/Cellar/libffi/3.0.13/lib/pkgconfig/
pip install -r requirements.txt
```
To run
```
cd <directory containing this file>
$VENV/bin/python setup.py develop
$VENV/bin/initialize_wondrous_db development.ini
$VENV/bin/pserve development.ini
```

### Backend Documentation
Sphinx Documentation is used to lessen the madness of a growing codebase. The documented ReST documents are located in ./docs.

To rebuild the autodocs
```
sphinx-apidoc wondrous -o docs
sudo make clean && sudo make html
```

The result html should be compiled to ```./_build/html/index.html```
Click on Module Index to see a list of modules
