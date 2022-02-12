"""REST API for comments."""
import flask
import insta485


@insta485.app.route('/api/v1/comments/', methods = ['POST'])
def create_comment():
    """Add one comment to a post."""
    postid = flask.request.args.get('postid')
    text = flask.request.args.get('text')
    #TODO FIX LATER WITH AUTHENTIFICATION
    logname = 'awdeorio'

    # Insert comment into table
    connection = insta485.model.get_db()
    cur = connection.execute(
        "INSERT INTO comments (owner, postid, text) "
        "VALUES (?, ?, ?) ",
        (logname, postid, text)
    )

    # Retrieve the ID of the inserted comment
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT last_insert_rowid() "
    )
    recent_id = cur.fetchone()
    logname_owns = True

    context = {
        "commentid" : recent_id['commentid'],
        "lognameOwnsthis": logname_owns,
        "owner": logname,
        "ownerShowUrl": "/users/"+logname+"/",
        "text": text,
        "url": "/api/v1/comments/"+ str(recent_id) +"/"
    }

    return flask.jsonify(**context), 201


@insta485.app.route('/api/v1/comments/<commentid>/', methods = ['DELETE'])
def delete_comment():
    """Delete a comment."""
    logname = 'awdeorio'
    commentid = flask.request.args.get('commentid')

    # If commentid DNE, return 404
    # If the user does not own the comment, return 403
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT owner "
        "FROM comments "
        "WHERE commentid = ? ",
        ([commentid])
    )
    comment_data = cur.fetchall()
    if not comment_data:
        flask.abort(404)
    elif comment_data[0]['owner'] != logname:
        flask.abort(403)

    # Delete the comment
    connection = insta485.model.getdb()
    cur = connection.execute(
        "DELETE FROM comments "
        "WHERE commentid = ? AND owner = ? ",
        ([commentid], logname)
    )

    return(403)