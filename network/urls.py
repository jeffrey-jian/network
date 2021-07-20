from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:username>", views.user, name="user"),

    # API routes
    path("get_posts/<str:type>", views.get_posts, name="get_posts"),
    path("get_userinfo", views.get_userinfo, name="get_userinfo"),
    path("new_post", views.new_post, name="new_post"),
    path("edit_post/<str:post_id>", views.edit_post, name="edit_post"),
    path("like_post/<str:post_id>", views.like_post, name="like_post"),
    path("follow/<str:followname>", views.follow, name="follow"),
    path("followers/<str:user>", views.followers, name="followers"),
]   
