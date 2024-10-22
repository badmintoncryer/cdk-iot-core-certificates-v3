import { join } from 'node:path';
import { Duration, ResourceProps } from 'aws-cdk-lib';
import { CfnCustomResource } from 'aws-cdk-lib/aws-cloudformation';
import { CompositePrincipal, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnParameter } from 'aws-cdk-lib/aws-ssm';
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

    const { thingName, saveToParamStore, paramPrefix } = props;

    const role = new Role(this, 'LambdaExecutionRole', {
      assumedBy: new CompositePrincipal(new ServicePrincipal('lambda.amazonaws.com')),
    });

    role.addToPolicy(
      new PolicyStatement({
        resources: ['arn:aws:logs:*:*:*'],
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      }),
    );

    role.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['iot:*'],
      }),
    );

    const onEventHandler = new NodejsFunction(this, 'lambdaFunction', {
      entry: join(__dirname, 'lambda', 'index.js'),
      handler: 'handler',
      timeout: Duration.seconds(10),
      role,
      logRetention: RetentionDays.ONE_DAY,
    });

    const { serviceToken } = new Provider(this, 'lambdaProvider', {
      onEventHandler,
    });

    const lambdaCustomResource = new CfnCustomResource(this, 'lambdaCustomResource', {
      serviceToken,
    });

    lambdaCustomResource.addPropertyOverride('ThingName', thingName);

    const paramStorePath = getParamStorePath(thingName, paramPrefix);

    if (saveToParamStore) {
      new CfnParameter(this, 'paramStoreCertPem', {
        type: 'String',
        value: lambdaCustomResource.getAtt('certPem').toString(),
        name: `${paramStorePath}/certPem`,
      });

      new CfnParameter(this, 'paramStorePrivKey', {
        type: 'String',
        value: lambdaCustomResource.getAtt('privKey').toString(),
        name: `${paramStorePath}/privKey`,
      });
    }

    this.thingArn = lambdaCustomResource.getAtt('thingArn').toString();
    this.certId = lambdaCustomResource.getAtt('certId').toString();
    this.certPem = lambdaCustomResource.getAtt('certPem').toString();
    this.privKey = lambdaCustomResource.getAtt('privKey').toString();
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
