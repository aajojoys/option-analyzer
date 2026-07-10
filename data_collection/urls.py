from django.urls import path, include
from data_collection.views import datacollection_api


urlpatterns = [
    path('api/', datacollection_api, name="datacollection_api"),
]
