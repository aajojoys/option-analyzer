import { fchar_capitalize } from "../base/utility.js";

export const EXCHANGE_NAME_BINANCE = "binance";
export const MARKET_TYPE_SPOT = "spot";
export const MARKET_TYPE_LINEAR = "linear";
export const BINANCESPOT_DB_NAME = EXCHANGE_NAME_BINANCE + fchar_capitalize(MARKET_TYPE_SPOT);
export const BINANCELINEAR_DB_NAME = EXCHANGE_NAME_BINANCE + fchar_capitalize(MARKET_TYPE_LINEAR);
export const KLINE_1M_STR = "1m";
export const KLINE_1D_STR = "1d";
export const MARKET_NAME_LIST = [BINANCESPOT_DB_NAME, BINANCELINEAR_DB_NAME];
export const MARKET_TYPE_LIST = [MARKET_TYPE_SPOT, MARKET_TYPE_LINEAR];

export const BASEFIELD_TIMESTAMP = "timestamp"
export const BASEFIELD_OPENTIME = "open_time";
export const BASEFIELD_SYMBOL = "symbol";
export const BASEFIELD_CSYMBOL = "contract_symbol";
export const BASEFIELD_EXPIRY = "expiry";
export const BASEFIELD_STRIKE = "strike";
export const BASEFIELD_OPTIONTYPE = "option_type";
export const BASEFIELD_MARKIV = "mark_iv"
export const BASEFIELD_MARK = "mark"
export const BASEFIELD_INDEXPRICE = "index_price"
export const BASEFIELD_OPEN = "open";
export const BASEFIELD_HIGH = "high";
export const BASEFIELD_LOW = "low";
export const BASEFIELD_CLOSE = "close";
export const BASEFIELD_VOLUME = "volume";
export const BASEFIELD_OPENINTEREST = "oi_contract";
export const BASEFIELD_BID = "bid";
export const BASEFIELD_ASK = "ask";
export const BASEFIELD_DELTA = "delta";
export const BASEFIELD_GAMMA = "gamma";
export const OPTIONTYPE_CALL = "C";
export const OPTIONTYPE_PUT = "P";
export const OPTIONTYPE_CALLNAME = "Call";
export const OPTIONTYPE_PUTNAME = "Put";
export const OPTIONTYPE_KEYNAME_OBJ = {
    [OPTIONTYPE_CALL]: OPTIONTYPE_CALLNAME,
    [OPTIONTYPE_PUT]: OPTIONTYPE_PUTNAME,
}