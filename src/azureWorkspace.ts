import * as crypto from 'crypto';
import * as core from '@actions/core';
import { WebRequest, WebResponse, sendRequest } from './httpClient';
import * as fileHelper from './fileHelper';

export async function postLogs(): Promise<void> {
  const workspaceId = core.getInput('workspace-id', { required: true });
  const workspaceSecret = core.getInput('workspace-secret', { required: true });
  const logType = core.getInput('log-type', { required: true });
  const date = new Date().toUTCString(); // rfc 1123

  let webRequest = new WebRequest();
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
  const postLogsResult: WebResponse = await sendRequest(webRequest);
  console.log(`Posted logs to Azure logs workspace. Statuscode: ${postLogsResult.statusCode}`);
}

function createHMACBase64Hash(secretKey: string, data: string) {
  return crypto
    .createHmac('sha256', Buffer.from(secretKey, 'base64'))
    .update(data, 'utf8')
    .digest('base64');
}

function getSignature(workspaceSecret: string, workspaceId: string, date: string, contentLength: number) {
  const contentType = 'application/json';
  const method = 'POST';
  const xHeaders = `x-ms-date:${date}`;
  const resource = '/api/logs';
  const stringToHash = `${method}\n${contentLength}\n${contentType}\n${xHeaders}\n${resource}`;
  const hmacHash = createHMACBase64Hash(workspaceSecret, stringToHash);
  const authorization = `SharedKey ${workspaceId}:${hmacHash}`;
  return authorization;
}

function getLogsPayload(): any {
  const logsPath = core.getInput('deployment-metadata-path', { required: true });
  const payload = fileHelper.getFileJson(logsPath);

  return payload;
}