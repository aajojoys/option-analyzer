from django.urls import path, include
from contract_details.views import ContractView

urlpatterns = [
    path('', ContractView.as_view(), name='contract_details'),
    path('<str:session_id>/', ContractView.as_view(), name='contract_details'),
    path('api/', ContractView.as_view(), name='contractdetails_api'),
]