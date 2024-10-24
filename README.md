# AWS IoT Core Thing with Certificate v3 construct

This is a CDK construct that creates an AWS IoT Core Thing with a certificate and policy using [aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3).

![elements](./images/iot.png)

Cloudformation does not support creating a certificate for an IoT Thing, so this construct uses the AWS SDK to create a certificate and attach it to the Thing.

This construct is a modified version of this excellent [construct (cdk-iot-core-certificate)](https://github.com/devops-at-home/cdk-iot-core-certificates) to work with aws-sdk-js-v3.

## Installation

```bash
npm i cdk-iot-core-certificates-v3
```

## Usage

```typescript
import { ThingWithCert } from 'cdk-iot-core-certificate-v3';

const thing = new ThingWithCert(this, 'MyThing', {
  // The name of the thing
  thingName: 'MyThing',
  // Whether to save the certificate and private key to the SSM Parameter Store
  saveToParamStore: true,
  // The prefix to use for the SSM Parameter Store parameters
  paramPrefix: 'test',
});

const thingArn = thing.thingArn;
const certId = thing.certId;
const certPem = thing.certPem;
const privateKey = thing.privKey;
```
