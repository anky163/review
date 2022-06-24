
from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class User(AbstractUser):
    pass


class Song(models.Model):
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name="uploader")

    title = models.CharField(max_length=64, blank=False)
    artists = models.CharField(max_length=64, blank=True)
    country = models.CharField(max_length=64, blank=True)
    genre = models.CharField(max_length=64, blank=True)
    date = models.DateTimeField()

    views = models.IntegerField(default=0)

    # Save file in music/media/songs or music/media/images
    # media folder was set up in settings.py (line 125)
    photo = models.ImageField(upload_to='images', blank=True, default=None)

    audio = models.FileField(upload_to='songs', blank=False, default=None)

    def __str__(self):
        return f"Title: {self.title}, Artists: {self.artists}, Uploader: {self.uploader.username}"

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "artists": self.artists,
            "image": f"{self.photo}",
            "audio": f"{self.audio}",
            "views": self.views
        }


class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    name = models.CharField(max_length=64, blank=False)
    tracks = models.ManyToManyField(Song, blank=True, related_name="track")

    def __str__(self):
        return f"ID: {self.id}, Name: {self.name}, Owner: {self.user.username}"