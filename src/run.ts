import * as core from '@actions/core';
import * as fs from 'fs';
let appInsights = require('applicationinsights');
import * as fileHelper from './fileHelper';
import * as AzureWorkspace from './azureWorkspace';

async function run() {
  try {
    await postDeploymentMetadata();
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function postDeploymentMetadata() {
  const target = core.getInput('target');
  if(target == 'ai') {
    const connectionString = core.getInput('connection-string', { required: true });

    appInsights.setup(connectionString);
    const appInsightsClient = appInsights.defaultClient;

    const eventData = getEventData();
    console.log('Posting event to Azure AppInsights...');
    console.debug(`Event data: ${JSON.stringify(eventData)}`);

    appInsightsClient.trackEvent(eventData);
    appInsightsClient.flush();

    console.log('Event posted!');
  } else {
    AzureWorkspace.postLogs();
  }
}

function getEventData(): any {
  const deploymentMetadataPath = core.getInput('deployment-metadata-path', { required: true });
  const deploymentMetadata = fileHelper.getFileJson(deploymentMetadataPath)
  const eventData = {
    name: 'GitHub.CI.Deployment',
    properties: deploymentMetadata
  };

  return eventData
}

run();