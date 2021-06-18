from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API routes
    path("get_posts/<str:type>", views.get_posts, name="get_posts"),
    path("get_userinfo", views.get_userinfo, name="get_userinfo")
]
