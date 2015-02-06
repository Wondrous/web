# web
This is the core web platform for Wondrous.


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

 #### Get User Wall
```
 GET -> '/api/wall/{username}/'
 ```
 #### Create New Post
```
 POST -> '/api/wall/'
 ```
 #### Get Majority Feed
```
 LOGIN REQUIRED
 GET ->  '/api/feed/'
 ```





 
