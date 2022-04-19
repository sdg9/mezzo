"use strict";
// npx tsc tools/executors/buildCoreWithWeb/impl
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
var devkit_1 = require("@nrwl/devkit");
var fs = require("fs");
var path = require("path");
/**
 * Look ma, it's cp -R.
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
var copyRecursiveSync = function (src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function (childItemName) {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    }
    else {
        fs.copyFileSync(src, dest);
    }
};
function echoExecutor(options, context) {
    var e_1, _a, e_2, _b;
    return __awaiter(this, void 0, void 0, function () {
        var buildClient, buildClient_1, buildClient_1_1, result, e_1_1, buildLib, buildLib_1, buildLib_1_1, result, e_2_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('Running executor 1');
                    console.log('Options: ', options);
                    return [4 /*yield*/, (0, devkit_1.runExecutor)({ project: 'admin-web', target: 'build' }, options, context)];
                case 1:
                    buildClient = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 7, 8, 13]);
                    buildClient_1 = __asyncValues(buildClient);
                    _c.label = 3;
                case 3: return [4 /*yield*/, buildClient_1.next()];
                case 4:
                    if (!(buildClient_1_1 = _c.sent(), !buildClient_1_1.done)) return [3 /*break*/, 6];
                    result = buildClient_1_1.value;
                    if (!result.success) {
                        return [2 /*return*/, result];
                    }
                    _c.label = 5;
                case 5: return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _c.trys.push([8, , 11, 12]);
                    if (!(buildClient_1_1 && !buildClient_1_1.done && (_a = buildClient_1["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _a.call(buildClient_1)];
                case 9:
                    _c.sent();
                    _c.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [4 /*yield*/, (0, devkit_1.runExecutor)({ project: 'core', target: 'build' }, {}, context)];
                case 14:
                    buildLib = _c.sent();
                    _c.label = 15;
                case 15:
                    _c.trys.push([15, 20, 21, 26]);
                    buildLib_1 = __asyncValues(buildLib);
                    _c.label = 16;
                case 16: return [4 /*yield*/, buildLib_1.next()];
                case 17:
                    if (!(buildLib_1_1 = _c.sent(), !buildLib_1_1.done)) return [3 /*break*/, 19];
                    result = buildLib_1_1.value;
                    if (!result.success) {
                        return [2 /*return*/, result];
                    }
                    _c.label = 18;
                case 18: return [3 /*break*/, 16];
                case 19: return [3 /*break*/, 26];
                case 20:
                    e_2_1 = _c.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 26];
                case 21:
                    _c.trys.push([21, , 24, 25]);
                    if (!(buildLib_1_1 && !buildLib_1_1.done && (_b = buildLib_1["return"]))) return [3 /*break*/, 23];
                    return [4 /*yield*/, _b.call(buildLib_1)];
                case 22:
                    _c.sent();
                    _c.label = 23;
                case 23: return [3 /*break*/, 25];
                case 24:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 25: return [7 /*endfinally*/];
                case 26:
                    copyRecursiveSync('./dist/apps/admin-web', './dist/libs/core/src/public' // TODO this may have to change based on how app is built
                    );
                    return [2 /*return*/, { success: true }];
            }
        });
    });
}
exports["default"] = echoExecutor;
