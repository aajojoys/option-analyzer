from django.db import models

class VisitorIpinfo(models.Model):
    ip_addr = models.GenericIPAddressField()
    ip_info = models.JSONField(
        default=dict
    )

class VisitorInfo(models.Model):
    timestamp = models.DateTimeField(
        auto_now_add=True
    )
    visitor_ipinfo = models.ForeignKey(
        'visitor.VisitorIpinfo',
        on_delete=models.CASCADE,
    )
    method = models.CharField(
        max_length=10
    )
    host = models.CharField(
        max_length=16
    )
    path = models.CharField(
        max_length=300
    )
    query_string = models.TextField(
        blank=True
    )
    user_agent = models.TextField(
        blank=True
    )
    referer = models.TextField(
        blank=True
    )
