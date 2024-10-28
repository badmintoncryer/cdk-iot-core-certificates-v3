import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { ThingWithCert } from '../src';

const app = new App();
const stack = new Stack(app, 'IntegTestStack');

const saveFileBucket = new s3.Bucket(stack, 'SaveFileBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const thingName = 'testThing';

const thingWithCert = new ThingWithCert(stack, 'ThingWithCert', {
  thingName,
  saveToParamStore: true,
  paramPrefix: 'test',
  saveFileBucket,
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

const integ = new IntegTest(app, 'IntegTest', {
  testCases: [stack],
});

integ.assertions
  .awsApiCall('S3', 'getObject', {
    Bucket: saveFileBucket.bucketName,
    Key: `${thingName}.cert.pem`,
  })
  .waitForAssertions({
    totalTimeout: Duration.minutes(5),
  });

integ.assertions
  .awsApiCall('S3', 'getObject', {
    Bucket: saveFileBucket.bucketName,
    Key: `${thingName}.private.key`,
  })
  .waitForAssertions({
    totalTimeout: Duration.minutes(5),
  });
