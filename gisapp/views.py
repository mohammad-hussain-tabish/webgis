from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
import jwt
from datetime import datetime, timedelta
from django.conf import settings
import requests
from django.http import HttpResponse
import json
import logging
import urllib.parse
import time

# Setup logger
logger = logging.getLogger(__name__)

def generate_jwt_token(user):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

@login_required
def home_page(request):
    if not request.session.get('jwt_token'):
        return redirect('signin')
    return render(request, 'index.html')

def test_layers(request):
    return render(request, 'test_layers.html')

def signin(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # Generate JWT token
            token = generate_jwt_token(user)
            # Store token in session
            request.session['jwt_token'] = token
            return redirect('home')
        else:
            messages.error(request, 'نام کاربری یا رمز عبور اشتباه است')
    
    return render(request, 'signin.html')

def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if password1 != password2:
            messages.error(request, 'رمز عبور مطابقت ندارد')
            return render(request, 'signup.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'این نام کاربری قبلاً ثبت شده است')
            return render(request, 'signup.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'این ایمیل قبلاً ثبت شده است')
            return render(request, 'signup.html')

        try:
            user = User.objects.create_user(username=username, email=email, password=password1)
            messages.success(request, 'ثبت نام با موفقیت انجام شد. لطفاً وارد شوید')
            return redirect('signin')
        except Exception as e:
            messages.error(request, 'خطا در ثبت نام. لطفاً دوباره تلاش کنید')

    return render(request, 'signup.html')

@login_required
def home_page(request):
    if not request.session.get('jwt_token'):
        return redirect('signin')
    return render(request, 'index.html')

def logout_view(request):
    if 'jwt_token' in request.session:
        del request.session['jwt_token']
    logout(request)
    return redirect('signin')
import requests
from django.http import HttpResponse
import json
import logging
import urllib.parse
import time

# تنظیم لاگر برای دیباگ
logger = logging.getLogger(__name__)

def home_page(request):
  return render(request,'index.html')

def test_layers(request):
  return render(request,'test_layers.html')

import requests
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
# Update the geoserver_proxy function to include authentication check
@login_required
def geoserver_proxy(request):
    """
    Proxy for GeoServer requests with authentication check
    """
    if not request.session.get('jwt_token'):
        return HttpResponse('Unauthorized', status=401)

    geoserver_url = 'http://localhost:8080/geoserver/wms'
    
    # Forward the request to GeoServer
    response = requests.get(geoserver_url, params=request.GET)
    
    # Return the response from GeoServer
    return HttpResponse(
        response.content,
        content_type=response.headers['Content-Type'],
        status=response.status_code
    )

