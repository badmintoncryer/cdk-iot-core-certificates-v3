import {
  AttachPrincipalPolicyCommandInput,
  AttachThingPrincipalCommandInput,
  AttachThingPrincipalCommandOutput,
  CreateKeysAndCertificateCommandOutput,
  CreatePolicyCommandOutput,
  CreateThingCommandInput,
  CreateThingCommandOutput,
  DetachPrincipalPolicyCommandInput,
  DetachThingPrincipalCommandInput,
  DetachThingPrincipalCommandOutput,
  ListThingPrincipalsCommandOutput,
} from '@aws-sdk/client-iot';

export interface IotPort {
  createThing: (thingRequest: CreateThingCommandInput) => Promise<CreateThingCommandOutput>;
  createKeysAndCertificates: () => Promise<CreateKeysAndCertificateCommandOutput>;
  createPolicy: (thingName: string) => Promise<CreatePolicyCommandOutput>;
  attachPrincipalPolicy: (props: AttachPrincipalPolicyCommandInput) => Promise<void>;
  attachThingPrincipal: (props: AttachThingPrincipalCommandInput) => Promise<AttachThingPrincipalCommandOutput>;
  listThingPrincipals: (thingName: string) => Promise<ListThingPrincipalsCommandOutput>;
  detachPrincipalPolicy: (props: DetachPrincipalPolicyCommandInput) => Promise<void>;
  detachThingPrincipal: (props: DetachThingPrincipalCommandInput) => Promise<DetachThingPrincipalCommandOutput>;
  updateCertificateToInactive: (certArn: string) => Promise<void>;
  deleteCertificate: (certArn: string) => Promise<void>;
  deletePolicy: (policyName: string) => Promise<void>;
  deleteThing: (thingName: string) => Promise<void>;
}
