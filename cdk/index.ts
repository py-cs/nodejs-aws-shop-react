import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_s3 as s3 } from "aws-cdk-lib";
import * as S3Deployment from "aws-cdk-lib/aws-s3-deployment";
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";

const app = new cdk.App();

class ShopAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "ShopAppBucket", {
      bucketName: "my-shop-app-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity",
      {
        comment: `Origin Access Identity for ShopApp (${bucket.bucketName})`,
      }
    );

    bucket.grantRead(originAccessIdentity);

    const distribution = new Distribution(this, "ShopAppDistribution", {
      defaultBehavior: {
        origin: new S3Origin(bucket, { originAccessIdentity }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    new S3Deployment.BucketDeployment(this, "ShopAppDeployment", {
      destinationBucket: bucket,
      sources: [S3Deployment.Source.asset("dist")],
      distribution: distribution,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "cloudfrontUrl", {
      value: distribution.distributionDomainName,
      description: "The URL of the CloudFront distribution",
    });

    new cdk.CfnOutput(this, "distributionId", {
      value: distribution.distributionId,
      description: "The ID of the CloudFront distribution",
    });

    new cdk.CfnOutput(this, "bucketUrl", {
      value: bucket.bucketWebsiteUrl,
      description: "The URL of the bucket",
    });
  }
}

new ShopAppStack(app, "ShopStack", { description: "Shop App Stack" });
