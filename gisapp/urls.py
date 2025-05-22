from django.urls import path
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('', views.home_page, name='home'),
    path('signin/', views.signin, name='signin'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('test-layers/', views.test_layers, name='test_layers'),
    path('geoserver/', csrf_exempt(views.geoserver_proxy), name='geoserver_proxy'),
]