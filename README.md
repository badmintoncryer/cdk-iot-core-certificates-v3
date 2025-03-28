# AWS IoT Core Thing with Certificate v3 construct

This is a CDK construct that creates an AWS IoT Core Thing with a certificate and policy using [aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3).

![elements](./images/iot.png)

Cloudformation does not support creating a certificate for an IoT Thing, so this construct uses the AWS SDK to create a certificate and attach it to the Thing.

This construct is a modified version of this excellent [construct (cdk-iot-core-certificate)](https://github.com/devops-at-home/cdk-iot-core-certificates) to work with aws-sdk-js-v3.

[![View on Construct Hub](https://constructs.dev/badge?package=cdk-iot-core-certificates-v3)](https://constructs.dev/packages/cdk-iot-core-certificates-v3)
[![Open in Visual Studio Code](https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc)](https://open.vscode.dev/badmintoncryer/cdk-iot-core-certificates-v3)
[![npm version](https://badge.fury.io/js/cdk-iot-core-certificates-v3.svg)](https://badge.fury.io/js/cdk-iot-core-certificates-v3)
[![Build Status](https://github.com/badmintoncryer/cdk-iot-core-certificates-v3/actions/workflows/build.yml/badge.svg)](https://github.com/badmintoncryer/cdk-iot-core-certificates-v3/actions/workflows/build.yml)
[![Release Status](https://github.com/badmintoncryer/cdk-iot-core-certificates-v3/actions/workflows/release.yml/badge.svg)](https://github.com/badmintoncryer/cdk-iot-core-certificates-v3/actions/workflows/release.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![Downloads](https://img.shields.io/badge/-DOWNLOADS:-brightgreen?color=gray)
![npm downloads](https://img.shields.io/npm/dt/cdk-iot-core-certificates-v3?label=npm&color=blueviolet)

## Installation

```bash
npm i cdk-iot-core-certificates-v3
```

## Usage

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';
import { ThingWithCert } from 'cdk-iot-core-certificates-v3';

declare const saveFileBucket: s3.IBucket;

const { thingArn, certId, certPem, privKey } = new ThingWithCert(this, 'MyThing', {
  // The name of the thing
  thingName: 'MyThing',
  // Whether to save the certificate and private key to the SSM Parameter Store
  saveToParamStore: true,
  // The prefix to use for the SSM Parameter Store parameters
  paramPrefix: 'test',
  // The bucket to save the certificate and private key to
  // Both files are saved at `{thingName}/{thingName}.private.key` and `{thingName}/{thingName}.cert.pem`
  // If not provided, the certificate and private key will not be saved
  saveFileBucket,
});
```

If you want to create multiple things and save certificates and private keys to the same bucket, you should not use `saveFileBucket` prop and save them at once by `BucketDeployment` construct.

This is because the each `saveFileBucket` prop will share a custom resource for each thing, which will cause the deployment to fail.

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { ThingWithCert } from 'cdk-iot-core-certificates-v3';

const thingNames = ['Thing1', 'Thing2', 'Thing3'];
const certBucket = new s3.Bucket(this, "CertBucket");
const sources: s3deploy.ISource[] = [];

thingNames.forEach((thingName, index) => {
  const { certPem, privKey } = new ThingWithCert(this, `Thing${index}`, {
    thingName,
    saveToParamStore: true,
  });
  sources.push(
    s3deploy.Source.data(`${thingName}/${thingName}.cert.pem`, certPem),
    s3deploy.Source.data(`${thingName}/${thingName}.private.key`, privKey)
  );
});

// Deploy the certificate and private key to the S3 bucket at once
new s3deploy.BucketDeployment(this, "DeployCerts", {
  sources,
  destinationBucket: certBucket,
});
```
