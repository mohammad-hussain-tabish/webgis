from django.shortcuts import redirect
import jwt
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import login

class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith('/admin/'):
            if request.path not in ['/signin/', '/signup/']:
                jwt_token = request.session.get('jwt_token')
                if not jwt_token:
                    return redirect('signin')
                try:
                    payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
                    user = User.objects.get(id=payload['user_id'])
                    if not request.user.is_authenticated:
                        login(request, user)
                except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
                    if 'jwt_token' in request.session:
                        del request.session['jwt_token']
                    return redirect('signin')

        response = self.get_response(request)
        return response

class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # اضافه کردن هدرهای CORS به تمام پاسخ‌ها
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        
        return response