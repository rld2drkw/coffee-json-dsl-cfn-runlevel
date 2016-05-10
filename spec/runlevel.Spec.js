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
      let mergedConditionName = Object.keys(templateObj.Conditions)
        .filter(condition => !condition.startsWith('MinRunlevel'))
        .filter(condition => condition !== 'IsValidBucketName')[0];

      expect(mergedConditionName).toBeDefined();
      expect(templateObj.Resources.MyCustomResource.Condition).toEqual(mergedConditionName);

      let mergedCondition = templateObj.Conditions[mergedConditionName];
      expect(mergedCondition).toEqual({'Fn::And': [{'Condition':'IsValidBucketName'}, {'Condition': 'MinRunlevel1'}]});
    });
  });
});
