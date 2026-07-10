from django.contrib import admin
from data_collection.models import *

class ExchangeInfoAdmin(admin.ModelAdmin):
    pass

class BaseFieldAdmin(admin.ModelAdmin):
    list_display = ['name', 'func_name', 'input_name', 'symbol', 'is_extra']
    search_fields = ('symbol', 'func_name', 'input_name', 'name',)
    list_filter = ('is_extra',)

class DatabaseInfoAdmin(admin.ModelAdmin):
    list_filter = ('exchange_info', 'market_type',)
    list_display = ['exchange_info', 'market_type', 'name']
    search_fields = ('name',)
    filter_horizontal = ('basefields',)

class ActivityInfoNameAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ('name',)

admin.site.register(ExchangeInfo, ExchangeInfoAdmin)
admin.site.register(BaseField, BaseFieldAdmin)
admin.site.register(DatabaseInfo, DatabaseInfoAdmin)
admin.site.register(ActivityInfoName, ActivityInfoNameAdmin)
