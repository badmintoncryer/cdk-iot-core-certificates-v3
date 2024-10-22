import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, CfnOutput, Stack } from 'aws-cdk-lib';
import { ThingWithCert } from '../src';

const app = new App();
const stack = new Stack(app, 'IntegTestStack');

const thingWithCert = new ThingWithCert(stack, 'ThingWithCert', {
  thingName: 'testThing',
  saveToParamStore: true,
  paramPrefix: 'test',
});

new CfnOutput(stack, 'ThingArn', {
  value: thingWithCert.thingArn,
});

new CfnOutput(stack, 'CertId', {
  value: thingWithCert.certId,
});

new CfnOutput(stack, 'CertPem', {
  value: thingWithCert.certPem,
});

new CfnOutput(stack, 'PrivKey', {
  value: thingWithCert.privKey,
});

new IntegTest(app, 'IntegTest', {
  testCases: [stack],
});
