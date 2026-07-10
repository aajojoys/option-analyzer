from django.db import models

# Create your models here.
class AssetBase(models.Model):
    symbol = models.CharField(
        max_length=16,
        unique=True,
    )
    name = models.CharField(
        max_length=32,
        unique=True,
        null=True,
        blank=True,
    )
    # is_stable will be modified manually (not implemented in asset_info.model_utils.py/ asset_info.view_utils.py)
    is_stable = models.BooleanField(
        default=False,
    )

    def __str__(self):
        return f"{self.symbol} ({self.name})"

class AssetInfo(models.Model):
    asset_base = models.ForeignKey(
        'asset_info.AssetBase',
        on_delete=models.CASCADE,
        null=True,
    )
    symbol = models.CharField(
        max_length=16,
    )
    is_active = models.BooleanField(
        default=True, # is_active=False indicates token/blockchain migration, token swap
    )
    old_symbol = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    inactive_time = models.DateTimeField(
        null=True,
        blank=True,
    )
    exchange_info = models.ForeignKey(
        'data_collection.ExchangeInfo',
        on_delete=models.CASCADE,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['symbol', 'exchange_info'], name="assetinfo_symbol_exchangeinfo")
        ]

    def __str__(self):
        return f"{self.exchange_info.name} - {self.symbol}"

class AssetPair(models.Model):
    base_asset = models.ForeignKey(
        'asset_info.AssetInfo',
        on_delete=models.CASCADE,
        related_name='base_asset',
    )
    quote_asset = models.ForeignKey(
        'asset_info.AssetInfo',
        on_delete=models.CASCADE,
        related_name='quote_asset',
    )
    symbol = models.CharField(
        max_length=32,
    )
    # base symbol of cex_symbol pair
    base_symbol = models.CharField(
        max_length=16,
        null=True,
    )
    # quote symbol of cex_symbol pair
    quote_symbol = models.CharField(
        max_length=16,
        null=True,
    )
    # symbolpair depending on cex
    cex_symbol = models.CharField(
        max_length=32,
        null=True,
    )
    isActive = models.BooleanField(
        default=True,
    )
    # tick_size & step_size records as number of decimals instead of tick_size & step_size in decimal form
    # caveat if tick_size or step_size does not start with 1 e.g. 0.0001 but 0.0002
    tick_size = models.IntegerField(
        default=8,
    )
    step_size = models.IntegerField(
        default=8,
    )
    database_info = models.ForeignKey(
        'data_collection.DatabaseInfo',
        on_delete=models.CASCADE,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['symbol', 'database_info'], name="assetpair_symbol_databaseinfo")
        ]

    def __str__(self):
        return f"{self.database_info.name} - {self.symbol}"
