from django.urls import path 
from asset_info.views import assetinfo_api

urlpatterns = [
    path('api/', assetinfo_api, name="assetinfo_api"),
]
