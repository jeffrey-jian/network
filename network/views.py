import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post


def index(request):
    return render(request, "network/index.html")

def user(request, username):
    return render(request, "network/user.html", {
        "profilename": username
    })

def get_userinfo(request):

    user = User.objects.get(username=request.user)
    return JsonResponse(user.serialize(), safe=False)



def get_posts(request, type):

    print(type)
    user = User.objects.get(username=request.user)

    if type == "all":
        posts = Post.objects.all()
    elif type == "following":
        followings = user.following.all()
        posts = Post.objects.filter(poster__in=followings)
    elif type == "liked":
        posts = user.my_likes.all()
    elif type == "self":
        posts = Post.objects.filter(poster=user)
    elif User.objects.filter(username=type).exists():
        profile = User.objects.get(username=type)
        posts = Post.objects.filter(poster=profile)
    else:
        return JsonResponse({"error": "Invalid type."}, status=400)

    # Return posts in reverse chronological order
    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)

@csrf_exempt
def new_post(request):

    # New post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Check if new post is empty
    data = json.loads(request.body)
    new_body = data.get("new_body")
    if new_body == "":
        return JsonResponse({"error": "Empty Body."}, status=400)
    
    # Create new post
    user = request.user
    post = Post(
        poster=user,
        body=new_body
    )
    post.save()

    return JsonResponse({"message": "Posted successfully."}, status=201)




def like_post(request, post_id):
    
    # Query for requested post
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    user = request.user
    if not user in post.likes.all():
        post.likes.add(user)
        post.save()
        print('POST LIKED..........')
        return JsonResponse({"message": "Post liked."}, status=200)
    else:
        post.likes.remove(user)
        post.save()
        print('POST UNLIKED..........')
        return JsonResponse({"message": "Post unliked."}, status=200)



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
