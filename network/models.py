from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("self", blank=True, related_name="followers")

    def serialize(self):
        return {
            "username": self.username,
            "email": self.email
        }

    def __str__(self):
        return f"{self.username}"

class Post(models.Model):
    
    # comments not implemented
    # main = models.BooleanField(default=True)
    # reply_to =  models.ForeignKey("Post", blank=True, null=True, on_delete=models.CASCADE, related_name="comments")
    
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_posts")
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now=True)
    likes = models.IntegerField(blank=True, default=0)

    def serialize(self):
        return {
            "poster": self.poster.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes,
        }

    def __str__(self):
         return f"{self.poster} posted '{self.body}' on {self.timestamp}"

