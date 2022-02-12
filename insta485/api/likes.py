"""REST API for likes."""
import flask
import insta485


@insta485.app.route('/api/v1/likes/', methods = ['POST'])
def create_like():
    """Create one like for a specific post."""
    postid = flask.request.args.get('postid')
    #TODO FIX LATER WITH AUTHENTIFICATION
    logname = 'awdeorio'

    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT COUNT(*) "
        "FROM likes "
        "WHERE owner = ? AND postid = ? ",
        (logname, postid)
    )
    data = cur.fetchall()
    lognameLikesThis = False
    if data[0]['COUNT(*)'] != 0:
        lognameLikesThis = True
    if lognameLikesThis:
        connection = insta485.model.get_db()
        cur = connection.execute(
            "SELECT likeid "
            "FROM likes "
            "WHERE owner = ? AND postid = ? ",
            (logname, postid)
        )
        data = cur.fetchone()
        context = {
            "likeid": data['likeid'],
            "url": flask.request.path + '/'+ str(data['likeid']) + '/'
        }
        return flask.jsonify(**context), 200
    else:
        connection = insta485.model.get_db()
        cur = connection.execute(
            "INSERT INTO likes(owner, postid) "
            "VALUES (?, ?) "
            ([logname], postid)
        )
        connection = insta485.model.get_db()
        cur = connection.execute(
            "SELECT likeid "
            "FROM likes "
            "WHERE owner = ? AND postid = ? ",
            (logname, postid)
        )
        data = cur.fetchone()
        context = {
            "likeid": data['likeid'],
            "url": flask.request.path + '/'+ str(data['likeid']) + '/'
        }
        return flask.jsonify(**context), 201
        

@insta485.app.route('/api/v1/likes/<likeid>/', methods = ['DELETE'])
def delete_like(likeid):
    """Delete one like, return 204 on success."""
    logname = 'awdeorio'
    #likeid = flask.request.args.get('likeid')

    # If likeid DNE, return 404
    # If user does not own the like, return 403
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT owner "
        "FROM likes "
        "WHERE likeid = ? ",
        ([likeid])
    )
    like_data = cur.fetchall()
    if not like_data:
        flask.abort(404)
    elif like_data[0]['owner'] != logname:
        flask.abort(403)

    # Delete the like
    connection = insta485.model.get_db()
    cur = connection.execute(
        "DELETE FROM likes "
        "WHERE likeid = ? AND owner = ? ",
        (likeid, logname)
    )

    return('', 204)