# set the runlevel of resources in this file
$.runlevel(1)

Parameters.BucketName=
  Type: 'String'
  Description: 'bucket name'
  Default: 'example-bucket'

Resources.MyBucket=
  Type: 'AWS::S3::Bucket'
  Condition: 'MinRunlevel3'
  Properties:
    BucketName: $.ref('BucketName')

Resources.MyCustomResource=
  Type: 'Custom::MyCustomResource'
  Condition: 'IsValidBucketName'

Resources.TestLambda=
  Type: 'AWS::Lambda::Function'
  Properties:
    Code:
      S3Bucket:
        Ref: 'BucketName'
      S3Key: 'example-lambda.zip'

Outputs.LambdaArn=
  Value: $.getAtt('TestLambda', 'Arn')

Conditions.IsValidBucketName=$.any($.ref('BucketName'), ['aaa', 'bbb', 'ccc', 'ddd'])
