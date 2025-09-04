from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from app import constants
from app.mirror import views as mirror_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", mirror_views.serve_react_app, name="react_app"),
]

# Only include mirror URLs if Mirror is enabled
if constants.MIRROR_ENABLED:
    urlpatterns.append(path("mirror/", include("app.mirror.urls")))
    # Add catch-all route for React app at /mirror/insights/ to handle client-side routing
    urlpatterns.append(path("mirror/insights/", mirror_views.serve_react_app, name="mirror_insights"))
    urlpatterns.append(path("mirror/insights/<uuid:uuid>/", mirror_views.serve_react_app, name="mirror_insights_with_uuid"))

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
