from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from app import constants
from app.mirror import views as mirror_views

urlpatterns = [
    path("admin/", admin.site.urls),
]

# Only include mirror URLs if Mirror is enabled
if constants.MIRROR_ENABLED:
    urlpatterns.append(path("mirror/", include("app.mirror.urls")))

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
