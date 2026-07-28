# Gunicorn configuration file for production deployment on Render
import mongoengine

def post_fork(server, worker):
    """
    Disconnect inherited PyMongo client sockets after Gunicorn forks worker processes.
    This prevents process fork socket collision and ensures each worker process opens
    its own clean connection pool to MongoDB.
    """
    mongoengine.disconnect_all()
    server.log.info(f"Worker {worker.pid}: Reset MongoEngine connection pool post-fork")
