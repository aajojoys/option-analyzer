from django.contrib import admin
from visitor.models import *

# Register your models here.
class VisitorInfoAdmin(admin.ModelAdmin):
    list_display = ('timestamp','visitor_ipinfo__id', 'path')
    list_filter = ['visitor_ipinfo']

class VisitorIpinfoAdmin(admin.ModelAdmin):
    list_display = ('pk', 'ip_addr', 'country', 'city', 'org', 'note')
	
    @admin.display(ordering='ip_info')
    def country(self, obj):
        return obj.ip_info.get('country')
    def city(self, obj):
        return obj.ip_info.get('city')
    def coordinate(self, obj):
        return (obj.ip_info.get('latitude'), obj.ip_info.get('longitude'))
    def note(self, obj):
        return obj.ip_info.get('note')
    def org(self, obj):
        org = obj.ip_info.get('org')
        if not org: 
            connection_dict = obj.ip_info.get('connection')
            if connection_dict: org = connection_dict.get('org')
        return org

admin.site.register(VisitorInfo, VisitorInfoAdmin)
admin.site.register(VisitorIpinfo, VisitorIpinfoAdmin)
