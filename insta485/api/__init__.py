"""Insta485 REST API."""
import flask
import insta485
import hashlib
from insta485.api.posts import get_posts
from insta485.api.posts import get_post
from insta485.api.likes import create_like
from insta485.api.likes import delete_like
from insta485.api.comments import create_comment
from insta485.api.comments import delete_comment


@insta485.app.route('/api/v1/')
def get_services():
    """Get URL resource URL services."""
    context = {
        "comments": "/api/v1/comments/",
        "likes": "/api/v1/likes/",
        "posts": "/api/v1/posts/",
        "url": flask.request.path,
    }
    return flask.jsonify(**context)
