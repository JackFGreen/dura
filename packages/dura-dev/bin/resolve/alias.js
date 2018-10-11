"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _util = require("../util");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultAlias = {};

function _default(userAlias) {
  var alias = _objectSpread({}, defaultAlias, userAlias);

  return Object.keys(alias).map(function (k) {
    return _defineProperty({}, k, (0, _util.getAbsPath)(alias[k]));
  }).reduce(function (prev, next) {
    return _objectSpread({}, prev, next);
  }, {});
}