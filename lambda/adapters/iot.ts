import { IoT } from '@aws-sdk/client-iot';
import { IotPort } from '../ports/iot';
import { getCertIdFromARN } from '../util/iot';

export const iotAdaptor = (iot: IoT): IotPort => {
  return {
    createThing: async (thingRequest) => {
      return iot.createThing(thingRequest);
    },
    createKeysAndCertificates: async () => {
      return iot
        .createKeysAndCertificate({
          setAsActive: true,
        });
    },
    createPolicy: async (thingName) => {
      return iot
        .createPolicy({
          policyName: thingName,
          policyDocument: policyDoc,
        });
    },
    attachPrincipalPolicy: async (props) => {
      await iot.attachPrincipalPolicy(props);
    },
    attachThingPrincipal: async (props) => {
      return iot.attachThingPrincipal(props);
    },
    listThingPrincipals: async (thingName) => {
      return iot
        .listThingPrincipals({
          thingName: thingName,
        });
    },
    detachPrincipalPolicy: async (props) => {
      await iot.detachPrincipalPolicy(props);
    },
    detachThingPrincipal: async (props) => {
      return iot.detachThingPrincipal(props);
    },
    updateCertificateToInactive: async (certArn) => {
      await iot
        .updateCertificate({
          certificateId: getCertIdFromARN(certArn),
          newStatus: 'INACTIVE',
        });
    },
    deleteCertificate: async (certArn) => {
      await iot
        .deleteCertificate({
          certificateId: getCertIdFromARN(certArn),
        });
    },
    deletePolicy: async (policyName) => {
      await iot
        .deletePolicy({
          policyName: policyName,
        });
    },
    deleteThing: async (thingName) => {
      await iot
        .deleteThing({
          thingName: thingName,
        });
    },
  };
};

const policyDoc = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish",
        "iot:Subscribe",
        "iot:Connect",
        "iot:Receive"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:GetThingShadow",
        "iot:UpdateThingShadow",
        "iot:DeleteThingShadow"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}`;
