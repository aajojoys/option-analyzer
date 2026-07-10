from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver

from data_collection.enums import (
    MARKET_TYPE_CHOICES,
)

class ExchangeInfo(models.Model):
    name = models.CharField(
        max_length=16,
        unique=True,
    )
    def __str__(self):
        return f"{self.name}"

class BaseField(models.Model):
    """
    BaseField will record basic fields of ActivityInfo (kline, open interest, etc)
        - e.g. kline contains 't' for open time, 'o' for open price, ...
        - BaseField.symbol has to be aligned with corresponding ta_lib.BaseIndicatorSetting.func_name (market.IndicatorSetting.func_name)
        - e.g close price: name (closePrice), input_name (close), symbol (c), func_name (CLOSEP)
    """
    # name of field e.g. 'openTime'
    name = models.CharField(
        max_length=32,
        unique=True,
    )
    # name of input for ta_lib
    # ta_lib has to be consistent with COLNAME_DICT
    input_name = models.CharField(
        max_length=16,
        unique=True,
    )
    # symbol use for field in mongod database (column key)  e.g. 't'
    symbol = models.CharField(
        max_length=8,
        unique=True,
    )
    # func_name use for field in function
    func_name = models.CharField(
        max_length=32,
        unique=True,
    )
    # record underlying activityinfo name for ease of retrieval in mongod_utils
    activityinfo_name = models.ForeignKey(
        'data_collection.ActivityInfoName',
        on_delete=models.CASCADE,
    )
    # is underlying field commonly provided in all exchanges or extra case
    is_extra = models.BooleanField()

    def __str__(self):
        return f"{self.name}, {self.symbol} ({self.func_name})"

class DatabaseInfo(models.Model):
    exchange_info = models.ForeignKey(
        'data_collection.ExchangeInfo',
        on_delete=models.CASCADE,
    )
    market_type = models.CharField(
        max_length=16,
        choices=MARKET_TYPE_CHOICES,
    )
    name = models.CharField(
        max_length=32,
        unique=True,
        null=True,
        blank=True,
    )
    # basefield will collect selected fields of underlying exchanges provided
    basefields = models.ManyToManyField(
        'data_collection.BaseField',
    )
    """
        basefield_options will record customize options for specific DatabaseInfo
        e.g. minimum of interval provided for specific field might be '5T' (5 minutes) instead of '1T' (1 minute)
        format as follows:
        {
            [basefield.pk]: {
                'min_period': 5,
                'is_broadcast': True,
                'broadcast_func': one of ['bfill', 'ffill', 'sum'],
                'aggregate_func': one of ['sum', 'max', 'min', 'first', 'last'],
                'has_realtime': False, # has_realtime in BaseField & DatabaseInfo level (same basefield could have different has_realtime depending on what cex offers)
            }
        }
    """
    basefield_options = models.JSONField(
        default=dict,
        blank=True,
    )
    # main (selected) quote asset for trading (screener) (the largest number of trading pairs based on quote asset or largest trading volume)
    # e.g. cex might have many trading pairs with quote assets of (BTC, USDC, USD, USDT) but one quote asset e.g. USDT as leading quote asset trading pairs
    main_quoteasset = models.ForeignKey(
        'asset_info.AssetInfo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    def __str__(self):
        return databaseinfo_generate_name(self.exchange_info.name, self.market_type)

def databaseinfo_generate_name(exchange_name, market_type):
    return f"{exchange_name + market_type[0].upper() + market_type[1:]}"

class ActivityInfoName(models.Model):
    name = models.CharField(
        max_length=16,
        unique=True,
    )

    def __str__(self):
        return f"{self.name}"

@receiver(pre_save, sender=DatabaseInfo)
def databaseinfo_add_name(sender, instance, **kwargs):
    instance.name = databaseinfo_generate_name(instance.exchange_info.name, instance.market_type)
