"""REST API for posts."""
import flask
import insta485


@insta485.app.route('/api/v1/posts/')
def get_posts():
    """Return 10 newest posts."""
    logname = 'awdeorio'
    size = flask.request.args.get('size', default=10, type=int)    
    page = flask.request.args.get('page', default=1, type=int)
    postid_lte = flask.request.args.get('postid_lte', default=size*page)
    results = []
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT posts.postid "
        "FROM posts "
        "WHERE owner IN "
        "(SELECT username2 FROM following WHERE username1 = ?) "
        "OR owner = ?"
        "ORDER BY postid DESC",
        (logname, logname)
    )
    post_data = cur.fetchall()
    max_attained = False
    
    for i in range(size*(page-1), size*page):
        if i >= len(post_data):
            max_attained = True
            break
        if post_data[i]['postid'] <= postid_lte:
            path = flask.request.path + '/' + str((post_data[i]['postid']))
            results.append({"postid": int(post_data[i]['postid']),
                            "url": flask.request.path + str((post_data[i]['postid'])) + '/'})
        else:
            max_attained = True
            break

    if max_attained:
        next_page = ""
    else:
        next_page = flask.request.path+("?size="+str(size))+("&page="+str(page+1))+("&postid_lte")+str(postid_lte)
        
    context = {
        "next": next_page,
        "results": results,
        "url": flask.request.path
    }
    
    return flask.jsonify(**context)

@insta485.app.route('/api/v1/posts/<int:postid_url_slug>/')
def get_post(postid_url_slug):
    """"Return the details for one post."""
    #logname = flask.session.get('username')
    logname = 'awdeorio'

    # COMMENTS SECTION
    comments = []
    connection = insta485.model.get_db()
    cur = connection.execute(
            "SELECT comments.commentid, comments.owner, comments.text "
            "FROM comments "
            "INNER JOIN posts ON comments.postid = posts.postid "
            "WHERE posts.postid = ? ",
            ([postid_url_slug])
    )
    comment_data = cur.fetchall()

    for comment in comment_data:
        comments.append({"commentid": int(comment['commentid']),
                        "lognameOwnsThis": logname == comment['owner'],
                        "owner": comment['owner'],
                        "ownerShowUrl": "/users/"+comment['owner']+"/",
                        "text": comment['text'],
                        "url": "/api/v1/comments/"+ str(comment['commentid']) +"/"})

    # LIKES SECTION
    # Check if logname has liked post
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT COUNT(*) "
        "FROM likes "
        "WHERE owner = ? AND postid = ? ",
        (logname, postid_url_slug)
    )
    data = cur.fetchall()
    lognameLikesThis = False
    if data[0]['COUNT(*)'] != 0:
        lognameLikesThis = True

    # Find number of likes
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT COUNT(*) "
        "FROM likes "
        "WHERE postid = ? ",
        ([postid_url_slug])
    )
    numLikes = cur.fetchall()
    
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT likeid "
        "FROM likes "
        "WHERE postid = ? ",
        ([postid_url_slug])
    )
    like_id = cur.fetchall()

    if lognameLikesThis:
        likes_url = "/api/v1/likes/" + str(like_id[0]['likeid']) + '/'
    else:
        likes_url = None
    
    likes = {
        "lognameLikesThis": lognameLikesThis,
        "numLikes": numLikes[0]['COUNT(*)'],
        "url": likes_url
            }

    # Get other data for context table
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT filename, owner, created "
        "FROM posts "
        "WHERE postid = ?",
        ([postid_url_slug])
    )
    post_data = cur.fetchall()

    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT filename "
        "FROM users "
        "WHERE username = ?",
        ([post_data[0]['owner']])
    )
    owner_pfp = cur.fetchall()

    context = {"comments": comments,
                "created": post_data[0]['created'],
                "imgUrl": "/uploads/" + post_data[0]['filename'],
                "likes": likes,
                "owner": post_data[0]['owner'],
                "ownerImgUrl": owner_pfp[0]['filename'] + '/',
                "ownerShowUrl": "/users/" + post_data[0]['owner'] + '/',
                "postShowUrl": "/posts/" + str(postid_url_slug) + '/',
                "postid": postid_url_slug ,
                "url": flask.request.path
    }
    
    return flask.jsonify(**context)