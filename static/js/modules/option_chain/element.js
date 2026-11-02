import { init_layout } from "../../base/layout";
import { MyPlot } from "../../base/plotly_utility";
import { ExpirySelect } from "../base/element";

class MarketSummary {
    constructor(state_obj, res_data) {
        return this._init(state_obj, res_data);
    }

    async _init(state_obj, res_data) {
        const griditem_elem = new GridItem();
        // const expiry_elem = new ExpirySelect(gridtitle_elem, state_obj, ['2023-01-01', '2023-02-01']);
        const gridcontainer_elem = new GridContainer(griditem_elem);
        const hcard_elem = new VCard(gridcontainer_elem, res_obj, []);
        return griditem_elem;
    }
}

class OptionChainTable {
    constructor(state_obj, res_data) {
        return this._init(state_obj, data);
    }

    _init(state_obj, res_data) {
        const griditem_elem = new GridItem();
        const gridtitle_elem = new GridTitle(griditem_elem);
        const expiry_elem = new ExpirySelect(gridtitle_elem, state_obj, ['2023-01-01', '2023-02-01']);
        const gridcontainer_elem = new GridContainer(griditem_elem);
        const row_data = [{K:58000,cb:4350,ca:4375,cm:4362,ci:62.4,cd:0.82,cg:0.00018,ct:-21.8,cv:38.4,coi:1842,cvol:136,pb:330,pa:345,pm:338,pi:63.1,pd:-0.18,pg:0.00017,pt:-12.6,pv:37.8,poi:694,pvol:31},{K:60000,cb:3125,ca:3142,cm:3133,ci:59.8,cd:0.68,cg:0.00021,ct:-23.7,cv:41.9,coi:2521,cvol:205,pb:735,pa:748,pm:742,pi:60.2,pd:-0.32,pg:0.00020,pt:-16.9,pv:41.2,poi:1128,pvol:74},{K:62000,cb:2088,ca:2102,cm:2095,ci:57.4,cd:0.51,cg:0.00023,ct:-24.5,cv:43.6,coi:3176,cvol:284,pb:1625,pa:1642,pm:1633,pi:57.5,pd:-0.49,pg:0.00023,pt:-24.1,pv:43.4,poi:3018,pvol:276},{K:64000,cb:1325,ca:1342,cm:1334,ci:55.2,cd:0.37,cg:0.00020,ct:-20.4,cv:40.1,coi:1975,cvol:163,pb:2858,pa:2874,pm:2866,pi:55.6,pd:-0.63,pg:0.00021,pt:-27.6,pv:40.8,poi:2478,pvol:189},{K:66000,cb:812,ca:826,cm:819,ci:54.0,cd:0.24,cg:0.00015,ct:-16.7,cv:34.5,coi:1214,cvol:85,pb:4312,pa:4335,pm:4324,pi:54.3,pd:-0.76,pg:0.00016,pt:-30.8,pv:35.1,poi:1746,pvol:118}];
        const colname_obj = {K: "Strike", cb: "Bid", ca: "Ask", cm: "Mark", ci: "IV", cd: "Delta", cg: "Gamma", ct: "Theta", cv: "Vega", coi: "Open Interest", cvol: "Volume", pb: "Bid", pa: "Ask", pm: "Mark", pi: "IV", pd: "Delta", pg: "Gamma", pt: "Theta", pv: "Vega", poi: "Open Interest", pvol: "Volume"};
        const structure_obj = {CALLS: ['cb', 'ca', 'cm', 'ci', 'cd', 'cg', 'ct', 'cv', 'coi', 'cvol'], STRIKE: ['K'], PUTS: ['pb', 'pa', 'pm', 'pi', 'pd', 'pg', 'pt', 'pv', 'poi', 'pvol']}
        const attr_obj = {cb: "positive", ca: "positive", ci: "positive", pb: "negative", pa: "negative", pi: "negative"}
        // const tattr_obj = {K: {pinned: "left"}}
        const table = new AGTable(gridcontainer_elem, row_data, colname_obj, structure_obj, attr_obj);
        return griditem_elem;
    }
}

export function create_oibystrike_expiry(container) {
    // const data = {"strike":{"51":28500.0,"52":28500.0,"50":29000.0,"64":29000.0,"57":29500.0,"53":29500.0,"54":30000.0,"66":30000.0,"60":30500.0,"61":30500.0,"62":30750.0,"59":30750.0,"65":31000.0,"63":31000.0,"58":31500.0,"56":31500.0,"68":32000.0,"67":32000.0,"55":32500.0,"69":32500.0},"oi_contract":{"51":0.0,"52":0.01,"50":4.19,"64":0.0,"57":0.04,"53":7.89,"54":10.69,"66":0.22,"60":4.32,"61":0.26,"62":0.12,"59":0.05,"65":0.0,"63":1.77,"58":0.0,"56":1.6,"68":8.47,"67":0.0,"55":2.51,"69":9.44},"option_type":{"51":"P","52":"C","50":"P","64":"C","57":"C","53":"P","54":"P","66":"C","60":"C","61":"P","62":"C","59":"P","65":"P","63":"C","58":"P","56":"C","68":"C","67":"P","55":"P","69":"C"}};
    const data = {'C': {'strike': [28500.0, 31500.0, 29500.0, 30500.0, 30750.0, 31000.0, 29000.0, 30000.0, 32000.0, 32500.0], 'oi_contract': [0.01, 1.6, 0.04, 4.32, 0.12, 1.77, 0.0, 0.22, 8.47, 9.44]}, 'P': {'strike': [29000.0, 28500.0, 29500.0, 30000.0, 32500.0, 31500.0, 30750.0, 30500.0, 31000.0, 32000.0], 'oi_contract': [4.19, 0.0, 7.89, 10.69, 2.51, 0.0, 0.05, 0.26, 0.0, 0.0]}}
    const title_obj = {x: 'strike', y: 'oi_contract'};
    const namekey_obj = {C: "Call", P: "Put", oi_contract: "Open Interest", strike: "Strike"};
    const plot = new MyPlot(container, data, PLOTTYPE_BAR, title_obj, true, [], namekey_obj);
}

export function create_volumebystrike_expiry(container) {
    // const data = {"strike":{"51":28500.0,"52":28500.0,"50":29000.0,"64":29000.0,"57":29500.0,"53":29500.0,"54":30000.0,"66":30000.0,"60":30500.0,"61":30500.0,"62":30750.0,"59":30750.0,"65":31000.0,"63":31000.0,"58":31500.0,"56":31500.0,"68":32000.0,"67":32000.0,"55":32500.0,"69":32500.0},"oi_contract":{"51":0.0,"52":0.01,"50":4.19,"64":0.0,"57":0.04,"53":7.89,"54":10.69,"66":0.22,"60":4.32,"61":0.26,"62":0.12,"59":0.05,"65":0.0,"63":1.77,"58":0.0,"56":1.6,"68":8.47,"67":0.0,"55":2.51,"69":9.44},"option_type":{"51":"P","52":"C","50":"P","64":"C","57":"C","53":"P","54":"P","66":"C","60":"C","61":"P","62":"C","59":"P","65":"P","63":"C","58":"P","56":"C","68":"C","67":"P","55":"P","69":"C"}};
    const data = {'C': {'strike': [28500.0, 31500.0, 29500.0, 30500.0, 30750.0, 31000.0, 29000.0, 30000.0, 32000.0, 32500.0], 'volume': [0.0, 1.6, 0.08, 4.85, 0.11, 1.7, 0.0, 0.3, 5.87, 10.09]}, 'P': {'strike': [29000.0, 28500.0, 29500.0, 30000.0, 32500.0, 31500.0, 30750.0, 30500.0, 31000.0, 32000.0], 'volume': [4.19, 0.0, 7.26, 10.66, 0.0, 0.0, 0.05, 0.45, 0.0, 0.0]}}
    const title_obj = {x: 'strike', y: 'volume'};
    const namekey_obj = {C: "Call", P: "Put", strike: "Strike", volume: "Volume"};
    const plot = new MyPlot(container, data, PLOTTYPE_BAR, title_obj, true, [], namekey_obj);
}

export function create_ivbystrike_expiry(container) {
    const data = {'C': {'strike': [28500.0, 29000.0, 29500.0, 30000.0, 30500.0, 30750.0, 31000.0, 31500.0, 32000.0, 32500.0], 'mark_iv': [0.55870304, 0.4558445, 0.35858164, 0.32841444, 0.33293873, 0.34760028, 0.37928671, 0.42580426, 0.52363038, 0.55414498], 'option_type': ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C']}, 'P': {'strike': [28500.0, 29000.0, 29500.0, 30000.0, 30500.0, 30750.0, 31000.0, 31500.0, 32000.0, 32500.0], 'mark_iv': [0.60875833, 0.51704943, 0.36637068, 0.33686519, 0.32764882, 0.30332694, 0.34164557, 0.51929483, 0.53758869, 0.7], 'option_type': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P']}}
    const title_obj = {x: 'strike', y: 'mark_iv'};
    const namekey_obj = {C: "Call", P: "Put", strike: "Strike", mark_iv: "Implied Volatility"};
    const plot = new MyPlot(container, data, PLOTTYPE_LINE, title_obj, true, [], namekey_obj);
}

export function create_ohlcv(container) {
    // const data = {'open_time': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'open': [99.44400902209496, 101.9803813463427, 103.23184256994753, 105.09317266914262, 107.55961268450119, 109.47493181178243, 111.11130555548023, 113.02080976128671, 115.5995721077463, 117.565928793822], 'high': [101.6679729337151, 102.0588559609719, 106.3044722901574, 108.72048199257216, 109.32116194649643, 111.57520456465274, 114.6660833335593, 116.93757071613986, 117.20128367676111, 119.30221361853401], 'low': [98.3320270662849, 101.9411440390281, 101.6955277098426, 103.27951800742784, 106.67883805350357, 108.42479543534726, 109.3339166664407, 111.06242928386014, 114.79871632323889, 116.69778638146599], 'close': [100.55599097790504, 102.0196186536573, 104.76815743005247, 106.90682733085738, 108.44038731549881, 110.52506818821757, 112.88869444451977, 114.97919023871329, 116.4004278922537, 118.434071206178], 'volume': [15.559909779050365, 10.196186536573, 17.68157430052469, 19.068273308573872, 14.403873154988094, 15.250681882175773, 18.886944445197663, 19.791902387132847, 14.004278922537011, 14.340712061780037]};
    const data = {'open_time': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'open': [99.2375494422788, 101.25423973615561, 103.27488002151264, 105.66995178602231, 107.69132198954357, 109.07187751597772, 111.94177939408505, 113.48486680179693, 115.60026955915146, 117.49942890313953], 'high': [102.28735167316358, 104.23728079153317, 106.17535993546207, 106.99014464193306, 108.9260340313693, 112.78436745206683, 112.17466181774485, 115.54539959460921, 117.19919132254564, 119.50171329058139], 'low': [97.71264832683642, 99.76271920846683, 101.82464006453793, 105.00985535806694, 107.0739659686307, 107.21563254793317, 111.82533818225515, 112.45460040539079, 114.80080867745436, 116.49828670941861], 'close': [98.47509888455761, 100.50847947231122, 102.54976004302529, 105.33990357204463, 107.38264397908713, 108.14375503195544, 111.8835587881701, 112.96973360359387, 115.2005391183029, 116.99885780627908], 'volume': [17.62450557721195, 17.45760263844387, 17.25119978487357, 13.300482139776854, 13.086780104564312, 19.281224840222794, 10.582206059149474, 15.151331982030701, 13.997304408485487, 15.005710968604632]};
    const title_obj = {x: 'open_time'};
    const namekey_obj = {};
    const plot = new MyPlot(container, data, PLOTTYPE_OHLCV, title_obj, false, [], namekey_obj);
}

export function create_surface(container) {
    const data = {"expiry": [1688083200, 1688169600, 1688256000, 1688688000, 1689292800, 1689897600, 1690502400, 1692921600, 1695945600, 1703808000, 1711670400, 1719532800], "strike": [15000.0, 16000.0, 18000.0, 20000.0, 21000.0, 22000.0, 23000.0, 24000.0, 24500.0, 25000.0, 26000.0, 27000.0, 28000.0, 28500.0, 29000.0, 29500.0, 30000.0, 30500.0, 30750.0, 31000.0, 31500.0, 32000.0, 32500.0, 33000.0, 34000.0, 35000.0, 36000.0, 38000.0, 40000.0, 42000.0, 45000.0, 46000.0, 50000.0, 60000.0, 65000.0, 70000.0, 80000.0, 85000.0], "mark_iv": [[0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, null, 0.7, 0.7, 0.7, 0.7, 0.7, 0.69668541, null, 0.43774734, null, null, 0.45925438, null, 0.77315125, null, 0.95, 0.95, 0.95, 0.95, null, 0.95, null, 0.95, null, 0.95, 0.95, null, null, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, 0.55870304, 0.4558445, 0.35858164, 0.32841444, 0.33293873, 0.34760028, 0.37928671, 0.42580426, 0.52363038, 0.55414498, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, 0.42701969, 0.35660992, 0.32318363, 0.35212934, 0.37494749, 0.32916367, 0.34537077, 0.39947331, 0.43335378, 0.48702568, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [null, null, null, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.67324886, 0.59007893, 0.48100481, null, 0.48658371, null, 0.39560944, null, null, null, null, 0.7, null, null, 0.7, null, 0.59772968, null, null, null, null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null, null, 0.58118114, 0.4813076, 0.41479359, 0.42986751, null, 0.42167604, null, 0.4081881, null, null, 0.40597081, null, 0.4240188, null, 0.43930501, 0.46860844, 0.49379468, 0.54226935, null, null, null, null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null, null, 0.49098501, 0.43546925, 0.44885635, 0.44988751, null, 0.42358994, null, 0.40671349, null, null, 0.4016903, null, 0.40452093, null, 0.42142779, 0.4379788, 0.45571625, 0.47564209, null, null, null, null, null, null, null, null, null, null, null], [null, null, 0.7, 0.7, null, 0.6470562, null, 0.52022705, null, 0.56792269, 0.47876606, 0.55210114, null, null, null, null, 0.42811513, null, null, 0.42218298, null, 0.42969555, null, null, 0.45096815, null, 0.48667371, null, 0.60299098, null, null, 0.68692833, 0.78058988, null, null, null, null, null], [null, null, 0.7, null, 0.59552441, null, 0.47735224, null, null, 0.59690714, 0.54111004, null, 0.46734512, null, null, null, 0.45145512, null, null, null, null, 0.45675397, null, null, 0.46496451, null, null, 0.50136447, null, 0.54806471, null, null, null, null, null, null, null, null], [0.7, null, null, 0.57615528, null, null, null, null, null, 0.54398179, null, 0.50102353, 0.49197674, null, null, null, 0.56306362, null, null, null, null, 0.46637088, null, 0.47071427, null, 0.48414886, null, null, 0.52607089, null, null, null, 0.60489535, null, 0.73941648, null, null, null], [0.97016869, null, null, 0.68263779, null, null, null, null, null, 0.54700732, null, 0.51399827, 0.5454278, null, null, null, 0.52783012, null, null, null, null, null, null, null, null, 0.52962899, null, null, 0.5537349, null, null, null, null, 0.64492345, null, null, 0.71805477, null], [0.9680706, null, null, 0.9164506, null, null, null, null, null, 0.61829686, null, null, null, null, 0.57132423, null, 0.56414187, null, null, null, null, null, null, null, null, 0.80075264, null, null, 0.61970592, null, null, null, 0.59824467, null, 0.66089094, null, null, 0.66944063], [0.97666979, null, null, 0.76793671, null, null, null, null, null, 0.65205276, null, null, null, null, null, null, 0.60202181, null, null, 0.59181631, null, null, null, null, null, 0.58217615, null, null, 0.58250815, null, null, null, 0.54189861, 0.62929839, null, 0.65600634, null, null]]}
    const title_obj = {x: 'strike', y: 'expiry', z: 'mark_iv'};
    const namekey_obj = {strike: "Strike", expiry: "Expiry", mark_iv: "Implied Volatility"};
    const plot = new MyPlot(container, data, PLOTTYPE_SURFACE, title_obj, false, [], namekey_obj);
} 

export function create_payoff(container) {
    const price = [
        70000,
        75000,
        80000,
        85000,
        90000,
        95000,
        100000,
        105000,
        110000,
        115000,
        120000,
        125000,
        130000
    ];

    const payoff = [
        -8000,
        -8000,
        -8000,
        -8000,
        -8000,
        -8000,
        -8000,
        -3000,
        2000,
        7000,
        12000,
        17000,
        22000
    ];
    const data = {payoff: payoff, price: price};
    const title_obj = {x: 'price', y: 'payoff'};
    const namekey_obj = {};
    const plot = new MyPlot(container, data, PLOTTYPE_PAYOFF, title_obj, false, [], namekey_obj);
}


class OIBYSTRIKE_PLOT {
    constructor(state_obj) {
        return this._init(state_obj);
    }
    _init(state_obj) {
        const griditem_elem = new GridItem();
        const gridtitle_elem = new GridTitle(griditem_elem);
        const expiry_elem = new ExpirySelect(gridtitle_elem, state_obj, ['2023-01-01', '2023-02-01']);
        const gridcontainer_elem = new GridContainer(griditem_elem);
        create_oibystrike_expiry(gridcontainer_elem);
        return griditem_elem;
    }
}

class VOLBYSTRIKE_PLOT {
    constructor(state_obj) {
        return this._init(state_obj);
    }
    _init(state_obj) {
        const griditem_elem = new GridItem();
        const gridtitle_elem = new GridTitle(griditem_elem);
        const expiry_elem = new ExpirySelect(gridtitle_elem, state_obj, ['2023-01-01', '2023-02-01']);
        const gridcontainer_elem = new GridContainer(griditem_elem);
        create_volumebystrike_expiry(gridcontainer_elem);
        return griditem_elem;
    }
}

class IVBYSTRIKE_PLOT {
    constructor(state_obj) {
        return this._init(state_obj);
    }
    _init(state_obj) {
        const griditem_elem = new GridItem();
        // const gridtitle_elem = new GridTitle(griditem_elem);
        // const expiry_elem = new ExpirySelect(gridtitle_elem, state_obj, ['2023-01-01', '2023-02-01']);
        const gridcontainer_elem = new GridContainer(griditem_elem);
        create_payoff(gridcontainer_elem);
        return griditem_elem;
    }
}

export function init_optionchain() {
    const element_arr = [MarketSummary, OptionChainTable, OIBYSTRIKE_PLOT, VOLBYSTRIKE_PLOT, IVBYSTRIKE_PLOT];
    const layout = init_layout(OPTIONCHAIN_CONFIG, OPTIONCHAIN_COMPONENTS, element_arr);
}
