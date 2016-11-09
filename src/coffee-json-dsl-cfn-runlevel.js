"use strict";

const Runlevel = Symbol();
const MergedConditionCount = Symbol();

module.exports = function(options) {
  return {
    DSL: {
      // set the runlevel of Resources and Outputs in the part
      runlevel: function(level) {
        this[Runlevel] = level;
      }
    },
    HOOK: {
      init: function(document) {
        this[MergedConditionCount] = 0;
      },

      beforeEach: function(part) {
        this[Runlevel] = 0;
      },

      afterEach: function(part) {
        let minRunlevel = this[Runlevel];
        [part.Resources, part.Outputs].forEach(elements => {
          for (let key in elements) {
            if (typeof elements[key].Condition === 'undefined'){
              elements[key].Condition = `MinRunlevel${minRunlevel}`;
            } else {
              if(!isRunlevelCondition(elements[key].Condition)) {
                elements[key].Condition = this.registerCondition(
                  this.and(
                    elements[key].Condition,
                    `MinRunlevel${minRunlevel}`
                  )
                );
              }
            }
          }
        });
      },

      finish: function(document) {
        let maxRunLevel = options.maxRunLevel || 5;
        let targetRunLevels = [];
        for (let minLevel = maxRunLevel; minLevel >= 0; minLevel--) {
          targetRunLevels.push(minLevel);
          document.Conditions[`MinRunlevel${minLevel}`] = this.any(this.ref('Runlevel'), targetRunLevels);
        }

        document.Parameters.Runlevel = {
          Type: 'Number',
          Default: maxRunLevel,
          AllowedValues: targetRunLevels,
          Description: `Enter the run level of this stack (0: stop all, ${maxRunLevel}: run all)`
        };
      }
    }
  }
}

function isRunlevelCondition(condition) {
  return typeof condition === 'string' && condition.startsWith('MinRunlevel');
}
