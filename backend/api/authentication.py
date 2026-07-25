from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from api.models import User

class MongoUserProxy:
    """Proxy object so MongoEngine User looks like Django Auth User to DRF"""
    def __init__(self, mongo_user):
        self.mongo_user = mongo_user
        self.id = str(mongo_user.id)
        self.username = mongo_user.username
        self.email = mongo_user.email
        self.role = mongo_user.role
        self.assigned_warehouse_id = mongo_user.assigned_warehouse_id
        self.is_active = mongo_user.is_active
        self.is_authenticated = True

    def __getattr__(self, name):
        return getattr(self.mongo_user, name)

    def __str__(self):
        return self.username


class MongoJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token_str = auth_header.split(' ')[1]
        try:
            token = AccessToken(token_str)
            user_id = token.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Invalid token payload')
            
            try:
                mongo_user = User.objects.get(id=user_id, is_active=True)
            except me.DoesNotExist if hasattr(me, 'DoesNotExist') else Exception:
                mongo_user = User.objects(id=user_id, is_active=True).first()

            if not mongo_user:
                raise AuthenticationFailed('User not found or inactive')

            return (MongoUserProxy(mongo_user), token_str)
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
