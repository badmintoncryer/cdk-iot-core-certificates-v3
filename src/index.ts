import { join } from 'node:path';
import { Duration, ResourceProps } from 'aws-cdk-lib';
import * as cfn from 'aws-cdk-lib/aws-cloudformation';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

/**
 * Properties of ThingWithCert construct
 */
export interface ThingWithCertProps extends ResourceProps {
  /**
   * The name of the thing
   */
  readonly thingName: string;

  /**
   * Whether to save the certificate and private key to AWS Systems Manager Parameter Store
   */
  readonly saveToParamStore?: boolean;

  /**
   * The prefix for the parameter store path
   */
  readonly paramPrefix?: string;

  /**
   * The bucket to save the certificate and private key files
   *
   * @default - do not save the files
   */
  readonly saveFileBucket?: s3.IBucket;
}

/**
 * A CDK Construct for creating an AWS IoT Core thing with a certificate
 */
export class ThingWithCert extends Construct {

  /**
   * The ARN of the thing
   */
  public readonly thingArn: string;

  /**
   * The ID of the certificate
   */
  public readonly certId: string;

  /**
   * The certificate PEM
   */
  public readonly certPem: string;

  /**
   * The private key
   */
  public readonly privKey: string;

  constructor(scope: Construct, id: string, props: ThingWithCertProps) {
    super(scope, id);

    const { thingName, saveToParamStore, paramPrefix, saveFileBucket } = props;

    const role = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('lambda.amazonaws.com')),
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        resources: ['arn:aws:logs:*:*:*'],
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      }),
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['iot:*'],
      }),
    );

    const onEventHandler = new nodejs.NodejsFunction(this, 'lambdaFunction', {
      entry: join(__dirname, 'lambda', 'index.ts'),
      handler: 'handler',
      timeout: Duration.seconds(10),
      role,
      runtime: lambda.Runtime.NODEJS_LATEST,
      logRetention: logs.RetentionDays.ONE_DAY,
    });

    const { serviceToken } = new Provider(this, 'lambdaProvider', {
      onEventHandler,
    });

    const lambdaCustomResource = new cfn.CfnCustomResource(this, 'lambdaCustomResource', {
      serviceToken,
    });

    lambdaCustomResource.addPropertyOverride('ThingName', thingName);

    const paramStorePath = getParamStorePath(thingName, paramPrefix);

    if (saveToParamStore) {
      new ssm.CfnParameter(this, 'paramStoreCertPem', {
        type: 'String',
        value: lambdaCustomResource.getAtt('certPem').toString(),
        name: `${paramStorePath}/certPem`,
      });

      new ssm.CfnParameter(this, 'paramStorePrivKey', {
        type: 'String',
        value: lambdaCustomResource.getAtt('privKey').toString(),
        name: `${paramStorePath}/privKey`,
      });
    }

    this.thingArn = lambdaCustomResource.getAtt('thingArn').toString();
    this.certId = lambdaCustomResource.getAtt('certId').toString();
    this.certPem = lambdaCustomResource.getAtt('certPem').toString();
    this.privKey = lambdaCustomResource.getAtt('privKey').toString();

    if (saveFileBucket) {
      new s3deploy.BucketDeployment(this, 'SaveFile', {
        sources: [
          s3deploy.Source.data(`${thingName}/${thingName}.cert.pem`, this.certPem),
          s3deploy.Source.data(`${thingName}/${thingName}.private.key`, this.privKey),
        ],
        destinationBucket: saveFileBucket,
      });
    }
  }
}

export const getParamStorePath = (thingName: string, paramPrefix?: string) => {
  if (thingName.charAt(0) === '/') {
    throw new Error("thingName cannot start with '/'");
  }

  if (paramPrefix && paramPrefix.charAt(0) === '/') {
    throw new Error("paramPrefix cannot start with '/'");
  }

  return paramPrefix ? `/${paramPrefix}/${thingName}` : `/${thingName}`;
};
