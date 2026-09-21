from data_collection.enums import COLNAME_MARKIV

def build_structure(OptionChain, strike, option_type, key=COLNAME_MARKIV):
    expiries = sorted(OptionChain.get_list_expiries())

    values = []
    for expiry in expiries:
        contract = OptionChain.get_contract(expiry, strike, option_type)

        if contract is None:
            values.append(None)
        else:
            values.append(
                contract.get(key)
            )

    return {
        "key": key,
        "strike": strike,
        "option_type": option_type,
        "expiries": expiries,
        "values": values,
    }
