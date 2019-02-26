"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var redux_actions_1 = require("redux-actions");
var lodash_1 = __importDefault(require("lodash"));
/**
 * 提取reducers
 * @param name
 * @param model
 */
function extractReducers(name, model) {
    var _a;
    var reducers = model.reducers;
    return _a = {},
        _a[name] = redux_actions_1.handleActions(lodash_1.default.keys(reducers)
            .map(function (reducerKey) {
            var _a;
            return (_a = {}, _a[name + "/" + reducerKey] = reducers[reducerKey], _a);
        })
            .reduce(lodash_1.default.merge, {}), model.state),
        _a;
}
/**
 * 提取effects
 * @param name
 * @param model
 */
function extractEffects(name, model) {
    var effects = model.effects;
    return lodash_1.default.keys(effects)
        .map(function (effectName) {
        var _a;
        return (_a = {}, _a[name + "/" + effectName] = effects[effectName], _a);
    })
        .reduce(lodash_1.default.merge, {});
}
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, ms); });
}
function getAsyncMiddleware(rootModel) {
    var _this = this;
    var rootEffects = lodash_1.default.keys(rootModel)
        .map(function (name) { return extractEffects(name, rootModel[name]); })
        .reduce(lodash_1.default.merge, {});
    return function (store) { return function (next) { return function (action) { return __awaiter(_this, void 0, void 0, function () {
        var result, dispatch, getState_1, select, effect;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = next(action);
                    if (!(typeof rootEffects[action.type] === "function")) return [3 /*break*/, 2];
                    dispatch = store.dispatch;
                    getState_1 = function () { return lodash_1.default.cloneDeep(store.getState()); };
                    select = function (_select) { return _select(getState_1()); };
                    effect = rootEffects[action.type];
                    return [4 /*yield*/, effect({
                            dispatch: dispatch,
                            select: select,
                            delay: delay
                        }, action)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, result];
            }
        });
    }); }; }; };
}
/**
 * 创建store
 * @param config
 */
function create(config) {
    var initialModel = config.initialModel, initialState = config.initialState, _a = config.middlewares, middlewares = _a === void 0 ? [] : _a;
    //actions
    var actions = extractActions(initialModel);
    //聚合reducers
    var rootReducers = Object.keys(initialModel)
        .map(function (name) { return extractReducers(name, initialModel[name]); })
        .reduce(function (prev, next) { return (__assign({}, prev, next)); }, {});
    //获取外部传入的 compose
    var composeEnhancers = config.compose || redux_1.compose;
    //store增强器
    var storeEnhancer = composeEnhancers(redux_1.applyMiddleware.apply(void 0, middlewares.concat([getAsyncMiddleware(initialModel)])));
    //获取外部传入的 createStore
    var _createStore = config.createStore || redux_1.createStore;
    //创建redux-store
    var reduxStore = initialState
        ? _createStore(redux_1.combineReducers(rootReducers), initialState, storeEnhancer)
        : _createStore(redux_1.combineReducers(rootReducers), storeEnhancer);
    return reduxStore;
}
exports.create = create;
function createActionCreator(rootModel) {
    return extractActions(rootModel);
}
exports.createActionCreator = createActionCreator;
function extractActions(models) {
    return lodash_1.default.keys(models)
        .map(function (name) { return extractAction(name, models[name]); })
        .reduce(lodash_1.default.merge, {});
}
function extractAction(name, model) {
    var _a;
    var _b = lodash_1.default.cloneDeep(model), reducers = _b.reducers, effects = _b.effects;
    return _a = {},
        _a[name] = lodash_1.default.keys(lodash_1.default.merge(reducers, effects))
            .map(function (reducerKey) {
            var _a;
            return (_a = {},
                _a[reducerKey] = redux_actions_1.createAction(name + "/" + reducerKey, function (payload) { return payload; }, function (payload, meta) { return meta; }),
                _a);
        })
            .reduce(lodash_1.default.merge, {}),
        _a;
}
//# sourceMappingURL=index.js.map