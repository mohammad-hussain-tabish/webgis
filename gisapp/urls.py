from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_page, name='home'),
    path('signin/', views.signin, name='signin'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('test-layers/', views.test_layers, name='test_layers'),
    # Update GeoServer proxy paths to handle different request types
    path('geoserver_proxy/', views.geoserver_proxy, name='geoserver_proxy'),
    path('geoserver_proxy/wms', views.geoserver_proxy, name='geoserver_wms'),
    path('geoserver_proxy/wfs', views.geoserver_proxy, name='geoserver_wfs'),
]