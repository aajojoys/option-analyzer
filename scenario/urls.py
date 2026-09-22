from django.urls import path, include
from scenario.views import ScenarioView

urlpatterns = [
    path('', ScenarioView.as_view(), name='scenario_analysis'),
    path('<str:session_id>/', ScenarioView.as_view(), name='scenario_analysis'),
    path('api/', ScenarioView.as_view(), name='scenarioanalysis_api'),
]