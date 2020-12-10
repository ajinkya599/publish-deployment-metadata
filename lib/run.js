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
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
let appInsights = require('applicationinsights');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connectionString = core.getInput('connection-string', { required: true });
            appInsights.setup(connectionString);
            const appInsightsClient = appInsights.defaultClient;
            const eventData = getEventData();
            console.log('Posting event to Azure AppInsights...');
            core.debug(`Event data: ${JSON.stringify(eventData)}`);
            appInsightsClient.trackEvent(eventData);
            appInsightsClient.flush();
            console.log('Event posted!');
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function getEventData() {
    const deploymentMetadataPath = core.getInput('deployment-metadata-path', { required: true });
    const deploymentMetadata = getFileJson(deploymentMetadataPath);
    const eventData = {
        name: 'GitHub.CI.Deployment',
        properties: deploymentMetadata
    };
    return eventData;
}
function getFileJson(path) {
    try {
        const rawContent = fs.readFileSync(path, 'utf-8');
        return JSON.parse(rawContent);
    }
    catch (ex) {
        throw new Error(`An error occured while parsing the contents of the file: ${path}. Error: ${ex}`);
    }
}
run();
