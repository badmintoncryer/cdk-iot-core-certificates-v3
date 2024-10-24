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
import { ThingWithCert } from 'cdk-iot-core-certificates-v3';

const { thingArn, certId, certPem, privKey } = new ThingWithCert(this, 'MyThing', {
  // The name of the thing
  thingName: 'MyThing',
  // Whether to save the certificate and private key to the SSM Parameter Store
  saveToParamStore: true,
  // The prefix to use for the SSM Parameter Store parameters
  paramPrefix: 'test',
});
```
