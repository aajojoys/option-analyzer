from django.contrib import admin
from asset_info.models import *

# Register your models here.
class AssetBaseAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'is_stable',)
    search_fields = ('symbol', 'name',)
    list_filter = ('is_stable', )

class AssetInfoAdmin(admin.ModelAdmin):
    list_display = ('exchange_info', 'symbol', 'is_active',)
    search_fields = ('symbol',)
    list_filter = ('exchange_info', )

class AssetPairAdmin(admin.ModelAdmin):
    list_display = ('database_info', 'symbol', 'cex_symbol', 'isActive',)
    search_fields = ('symbol', 'cex_symbol',)
    list_filter = ('database_info', 'isActive',)

admin.site.register(AssetBase, AssetBaseAdmin)
admin.site.register(AssetInfo, AssetInfoAdmin)
admin.site.register(AssetPair, AssetPairAdmin)
