from data_collection.enums import COLNAME_MARKIV


def build_surface(OptionChain, option_type, key=COLNAME_MARKIV):
    expiries = sorted(OptionChain.get_list_expiries())

    strike_set = set()
    for expiry in expiries: strike_set.update(OptionChain.get_list_strikes(expiry))
    strikes = sorted(strike_set)

    values = []
    for strike in strikes:
        row = []
        for expiry in expiries:
            contract = OptionChain.get_contract(expiry, strike, option_type)
            if contract is None:
                row.append(None)
            else:
                row.append(contract[key])
        values.append(row)

    return {
        "key": key,
        "strikes": strikes,
        "option_type": option_type,
        "expiries": expiries,
        "values": values,
    }
