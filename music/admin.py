from django.contrib import admin

from .models import User, Song, Playlist


class SongAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "artists", "genre", "uploader", "date", "audio", "photo"]
    search_fields = ["title"]


class PlaylistAdmin(admin.ModelAdmin):
    filter_horizontal = ("tracks",)


# Register your models here.
admin.site.register(User)
admin.site.register(Song, SongAdmin)
admin.site.register(Playlist, PlaylistAdmin)
