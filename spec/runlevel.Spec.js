"use strict";

const Cfn = require('coffee-json-dsl');

describe('runlevel', function() {
  let cfn = null;
  beforeEach(function() {
    cfn = new Cfn();
    cfn.use('cfn');
    cfn.use(`${__dirname}/../src/cfn-runlevel`);
  });

  describe('generated JSON', function() {
    let templateString = '';
    let templateObj = null;

    beforeEach(function() {
      cfn.load(`${__dirname}/fixtures/templates/example.coffee`);
      templateString = cfn.generate();
      templateObj = JSON.parse(templateString);
    });

    it('adds MinRunlevel Conditions', function() {
      expect(templateObj.Conditions.MinRunlevel1).toBeDefined();
      expect(templateObj.Conditions.MinRunlevel2).toBeDefined();
      expect(templateObj.Conditions.MinRunlevel3).toBeDefined();
      expect(templateObj.Conditions.MinRunlevel4).toBeDefined();
      expect(templateObj.Conditions.MinRunlevel5).toBeDefined();
    });

    it('adds MinRunlevel Condtions to Resources and Outputs',function() {
      expect(templateObj.Resources.TestLambda.Condition).toEqual('MinRunlevel1');
      expect(templateObj.Outputs.LambdaArn.Condition).toEqual('MinRunlevel1');
    });

    it('does not add MinRunlevel Condtions to Parameters',function() {
      expect(templateObj.Parameters.BucketName.Condition).not.toBeDefined();
    });

    it('does not overwrite MinRunlevel Condtion',function() {
      expect(templateObj.Resources.MyBucket.Condition).toEqual('MinRunlevel3');
    });

    it('merges existing Condtion with MinRunlevel condition', function() {
      let mergedConditionName = templateObj.Resources.MyCustomResource.Condition;
      expect(mergedConditionName).toBeDefined();

      let mergedCondition = templateObj.Conditions[mergedConditionName];
      expect(mergedCondition).toBeDefined();
      expect(mergedCondition).toEqual({'Fn::And': [{'Condition':'IsValidBucketName'}, {'Condition': 'MinRunlevel1'}]});
    });

    it('merges existing complex condition with MinRunlevel condition', function() {
      let mergedConditionName = templateObj.Resources.ComplexConditionLambda.Condition;
      expect(mergedConditionName).toBeDefined();

      let mergedCondition = templateObj.Conditions[mergedConditionName];
      expect(mergedCondition).toBeDefined();
      expect(mergedCondition).toEqual({
        'Fn::And': [
          {'Fn::Equals': [{Ref: 'BucketName'}, 'example-bucket']},
          {Condition: 'MinRunlevel1'}
        ]
      });
    });
  });
});
