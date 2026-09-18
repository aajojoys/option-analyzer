from django.urls import path, include
from option_chain.views import OptionChainView

urlpatterns = [
    path('', OptionChainView.as_view(), name='option_chain'),
    path('<str:session_id>/', OptionChainView.as_view(), name='option_chain'),
    path('api/', OptionChainView.as_view(), name='optionchain_api'),
]