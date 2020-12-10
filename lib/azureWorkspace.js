"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postLogs = void 0;
const crypto = __importStar(require("crypto"));
const core = __importStar(require("@actions/core"));
const httpClient_1 = require("./httpClient");
const fileHelper = __importStar(require("./fileHelper"));
function postLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceId = core.getInput('workspace-id', { required: true });
        const workspaceSecret = core.getInput('workspace-secret', { required: true });
        const logType = core.getInput('log-type', { required: true });
        const date = new Date().toUTCString(); // rfc 1123
        let webRequest = new httpClient_1.WebRequest();
        webRequest.method = 'POST';
        webRequest.uri = `https://${workspaceId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`;
        webRequest.body = JSON.stringify(getLogsPayload());
        const authorization = getSignature(workspaceSecret, workspaceId, date, webRequest.body.length);
        webRequest.headers = {
            "Authorization": authorization,
            "Content-Type": "application/json",
            "Log-Type": logType,
            "x-ms-date": date
        };
        console.log(`Posting to LA workspace: ${webRequest.body}`);
        const postLogsResult = yield httpClient_1.sendRequest(webRequest);
        console.log(`Posted logs to Azure logs workspace. Statuscode: ${postLogsResult.statusCode}`);
    });
}
exports.postLogs = postLogs;
function createHMACBase64Hash(secretKey, data) {
    return crypto
        .createHmac('sha256', Buffer.from(secretKey, 'base64'))
        .update(data, 'utf8')
        .digest('base64');
}
function getSignature(workspaceSecret, workspaceId, date, contentLength) {
    const contentType = 'application/json';
    const method = 'POST';
    const xHeaders = `x-ms-date:${date}`;
    const resource = '/api/logs';
    const stringToHash = `${method}\n${contentLength}\n${contentType}\n${xHeaders}\n${resource}`;
    const hmacHash = createHMACBase64Hash(workspaceSecret, stringToHash);
    const authorization = `SharedKey ${workspaceId}:${hmacHash}`;
    return authorization;
}
function getLogsPayload() {
    const logsPath = core.getInput('deployment-metadata-path', { required: true });
    const payload = fileHelper.getFileJson(logsPath);
    return payload;
}
