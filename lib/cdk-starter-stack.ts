import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 Create role
    const role1 = new iam.Role(this, 'iam-role-id-1', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // 👇 only allow tag creation and deletion
    // of tags with key of `my-tag-key` or `your-tag-key`
    const policyWithConditions = new iam.PolicyStatement({
      actions: ['ec2:CreateTags', 'ec2:DeleteTags'],
      resources: ['*'],
      conditions: {
        'ForAllValues:StringEquals': {
          'aws:TagKeys': ['my-tag-key', 'your-tag-key'],
        },
      },
    });

    role1.addToPolicy(policyWithConditions);

    // 👇 add a single condition
    policyWithConditions.addCondition('StringEquals', {
      'ec2:AuthorizedService': 'lambda.amazonaws.com',
    });

    // 👇 add multiple conditions
    policyWithConditions.addConditions({
      DateLessThan: {
        'aws:CurrentTime': '2022-12-31T23:59:59Z',
      },
      DateGreaterThan: {
        'aws:CurrentTime': '2021-04-27T23:59:59Z',
      },
    });

    const role2 = new iam.Role(this, 'iam-role-id-2', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description:
        'grants permission to list all of the objects in all s3 buckets under a public prefix',
      inlinePolicies: {
        ListBucketObjectsPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              resources: ['arn:aws:s3:::*'],
              actions: ['s3:ListBucket'],
              // 👇 limit the response of the ListBucket action
              conditions: {
                StringEquals: {
                  's3:prefix': 'public',
                },
              },
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.DENY,
              resources: ['arn:aws:s3:::*'],
              actions: ['s3:ListBucket'],
              // 👇 DENY all but objects with public prefix
              conditions: {
                StringNotEquals: {
                  's3:prefix': 'public',
                },
              },
            }),
          ],
        }),
      },
    });
  }
}
