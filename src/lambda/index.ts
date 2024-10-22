import { IoT } from '@aws-sdk/client-iot';
import { ServiceException } from '@smithy/smithy-client';
import {
  CloudFormationCustomResourceSuccessResponse as Success,
  CloudFormationCustomResourceFailedResponse as Failure,
  CloudFormationCustomResourceEvent as Event,
} from 'aws-lambda';
import { iotAdaptor } from './adapters/iot';
import { thingAdaptor } from './adapters/thing';

const thingHandler = thingAdaptor(iotAdaptor(new IoT()));

export const handler = async (event: Event): Promise<Success | Failure> => {
  const { RequestType, LogicalResourceId, RequestId, StackId } = event;

  try {
    const thingName = event.ResourceProperties.ThingName;
    if (RequestType === 'Create') {
      const { thingArn, certId, certPem, privKey } = await thingHandler.create(thingName);

      return {
        Status: 'SUCCESS',
        PhysicalResourceId: thingArn,
        LogicalResourceId,
        RequestId,
        StackId,
        Data: {
          thingArn,
          certId,
          certPem,
          privKey,
        },
      };
    } else if (event.RequestType === 'Delete') {
      await thingHandler.delete(thingName);

      return {
        Status: 'SUCCESS',
        PhysicalResourceId: event.PhysicalResourceId,
        LogicalResourceId,
        RequestId,
        StackId,
      };
    } else if (event.RequestType === 'Update') {
      return {
        Status: 'SUCCESS',
        PhysicalResourceId: event.PhysicalResourceId,
        LogicalResourceId,
        RequestId,
        StackId,
      };
    } else {
      throw new Error('Received invalid request type');
    }
  } catch (err) {
    const Reason = (err as ServiceException).message;

    return {
      Status: 'FAILED',
      Reason,
      RequestId,
      StackId,
      LogicalResourceId,
      // @ts-ignore
      PhysicalResourceId: event.PhysicalResourceId || LogicalResourceId,
    };
  }
};
