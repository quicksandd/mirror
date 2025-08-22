from django.urls import path
from . import views

app_name = 'mirror'

urlpatterns = [
    path('api/export-guide/', views.export_guide, name='export_guide'),
    path('api/process/', views.process_data, name='process_data'),
    path(
        'api/insights/<uuid:uuid>/',
        views.insights_view,
    ),
    path('api/save/', views.save_insights, name='save_insights'),
]
