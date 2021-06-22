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
    
    id = models.AutoField(primary_key=True)
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_posts")
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, blank=True, related_name="my_likes")

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.poster.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": [user.username for user in self.likes.all()]
        }

    def __str__(self):
         return f"POST{self.id}: {self.poster} posted '{self.body}' on {self.timestamp}"

