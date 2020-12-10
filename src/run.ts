import * as core from '@actions/core';
import * as fs from 'fs';
let appInsights = require('applicationinsights');

async function run() {
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
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getEventData(): any {
  const deploymentMetadataPath = core.getInput('deployment-metadata-path', { required: true });
  const deploymentMetadata = getFileJson(deploymentMetadataPath)
  const eventData = {
    name: 'GitHub.CI.Deployment',
    properties: deploymentMetadata
  };

  return eventData
}

function getFileJson(path: string): any {
  try {
    const rawContent = fs.readFileSync(path, 'utf-8');
    return JSON.parse(rawContent);
  } catch (ex) {
    throw new Error(`An error occured while parsing the contents of the file: ${path}. Error: ${ex}`);
  }
}

run();