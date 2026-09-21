from data_collection.enums import COLNAME_MARKIV, OPTIONTYPE_CALL, OPTIONTYPE_PUT


def build_smile(OptionChain, expiry, option_type):
    data = OptionChain.get_expiry(expiry)
    strikes = list(data.keys())
    iv_list = []

    for strike in sorted(data):
        contracts = expiry[strike]
        
        if (option_type == OPTIONTYPE_CALL) and (option_type in contracts):
            iv_list.append(contracts[OPTIONTYPE_CALL][COLNAME_MARKIV])
        elif (option_type == OPTIONTYPE_PUT) and (option_type in contracts):
            iv_list.append(contracts[OPTIONTYPE_PUT][COLNAME_MARKIV])
        else:
            iv_list.append(None)

    return {
        "expiry": expiry,
        "option_type": option_type,
        "strikes": strikes,
        "iv": iv_list,
    }
