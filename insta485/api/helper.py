"""REST API of helper functions."""
import flask
import insta485
import hashlib
from flask import jsonify


def authenticate_user(username, password):
    """Authenticate username and password."""
    username = flask.request.authorization['username']
    password = flask.request.authorization['password']

    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT password "
        "FROM users "
        "WHERE username = ? ",
        ([username])
    )
    db_password = cur.fetchone()
    if not db_password:
        raise InvalidUsage('FORBIDDEN', status_code=403)

    if pass_check(password, db_password['password']):
        return username
    flask.abort(403)


def pass_check(new, database):
    """Display pass_check."""
    algorithm, salt, curpasshash = database.split('$')
    hash_obj = hashlib.new(algorithm)
    password_salted = salt + new
    hash_obj.update(password_salted.encode('utf-8'))
    newpasshash = hash_obj.hexdigest()
    return newpasshash == curpasshash


class InvalidUsage(Exception):
    """Error handling."""

    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        """Error handling."""
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        """Error handling."""
        rv = dict(self.payload or ())
        rv['message'] = self.message
        rv['status_code'] = self.status_code
        return rv


@insta485.app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    """Error handling."""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response
