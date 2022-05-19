from django.contrib import admin

from .models import User, Email

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username")

class EmailAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "sender", "subject", "body", "timestamp", "read", "archived")
    filter_horizontal = ("recipients",)

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Email, EmailAdmin)