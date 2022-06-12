import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

import { join } from 'path';
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class SpaceStack extends Stack {
  private api = new RestApi(this, 'SpaceApi');
  private spaceTable = new GenericTable('SpaceTable', 'spaceId', this);

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // const helloLambda = new Function(this, 'HelloFunction', {
    //   runtime: Runtime.NODEJS_16_X,
    //   code: Code.fromAsset(join(__dirname, '..', 'services', 'hello')),
    //   handler: 'hello.main',
    // });

    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions('s3:ListAllMyBuckets');
    s3ListPolicy.addResources('*');

    const helloNodeLambda = new NodejsFunction(this, 'HelloNodeFunction', {
      entry: join(__dirname, '..', 'services', 'hello-node', 'index.ts'),
      handler: 'handler',
    });
    helloNodeLambda.addToRolePolicy(s3ListPolicy);

    // Hello Api lambda integration
    const helloLambdaIntegration = new LambdaIntegration(helloNodeLambda);
    const helloLambdaResource = this.api.root.addResource('hello');
    helloLambdaResource.addMethod('GET', helloLambdaIntegration);
  }
}
