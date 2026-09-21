from django.urls import path, include
from volatility.views import VolatilityView

urlpatterns = [
    path('', VolatilityView.as_view(), name='volatility'),
    path('<str:session_id>/', VolatilityView.as_view(), name='volatility'),
    path('api/', VolatilityView.as_view(), name='volatility_api'),
]