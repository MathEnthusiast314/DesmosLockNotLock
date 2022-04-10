// ==UserScript==
// @name        DesmosLockNotLock
// @version     1.0
// @author      MathEnthusiast314
// @description Duplicate expressions to what they compile to!
// @grant       none
// @match       https://*.desmos.com/calculator*
// @downloadURL https://github.com/MathEnthusiast314/DesmosLockNotLock/blob/main/duplicate.user.js
// @updateURL https://github.com/MathEnthusiast314/DesmosLockNotLock/blob/main/duplicate.user.js
// ==/UserScript==

(function() {
    'use strict';

function start(){

	if (window.location.href.includes("desmos.com/calculator")) {
		if (typeof Calc != "undefined") {
            var DLock = {};
            DLock.computeContext = function() {
                // Emulate what goes on in the web worker
                const Context = require("core/math/context").Context;
                const context = new Context();
                const changeSet = {
                    isCompleteState: true,
                    statements: {},
                };
                for (let stmt of Calc.controller.getAllItemModels()) {
                    if (stmt.type !== "expression") continue;
                    changeSet.statements[stmt.id] = stmt;
                }
                context.processChangeSet(changeSet);
                context.updateAnalysis();
                return context;
            }

            DLock.thevalue =function (variable0) {
                var ctx = DLock.computeContext()
                var vard = ''
                if (typeof(variable0) == 'number') {
                    vard = ctx.analysis[variable0].rawTree
                } else {
                    vard = ctx.frame[variable0]
                }
                if (vard) {
                    if (vard.userData) {
                        var Depend = vard._dependencies.filter((e) => !vard._dummyDependencies.includes(e) && (e.includes('_') || (e.length == 1 && e != 'e')))
                        var removeeq = new RegExp(vard._symbol + ' *= *(.*)', "g")
                        var matched = Array.from(vard._inputSpan.input.matchAll(removeeq))
                        let finalstr;
                        console.log(matched);
                        if (matched.length==0&&typeof(variable0) == 'number'){
                            finalstr=vard._inputSpan.input
                        }else if (matched.length>0){
                            finalstr = matched[0][1]
                        }
                        if (finalstr) {
                            if (Depend.length == 0) {
                                return (finalstr)
                            } else {
                                Depend.forEach(function(item, index) {
                                    let vval = DLock.thevalue(item);
                                    if (vval != undefined) {
                                        var re = new RegExp(item, "g")
                                        finalstr = finalstr.replace(re, '\\left(' + vval.toString() + '\\right)')
                                    }
                                });
                                return (finalstr)
                            }
                        }
                    }
                }

            }

			DLock.lastSelectedExpression = false;
			DLock.set = function() {
				if (Calc.isAnyExpressionSelected) DLock.lastSelectedExpression = Calc.selectedExpressionId;
				var selected = DLock.lastSelectedExpression;
				if (selected === false) {
					window.alert("Please select an expression");
					return
				}
				var expr = DLock.getExpression(selected);
				expr.latex = DLock.thevalue(Number(selected));
				expr.id = "new" + (new Date()).getTime();
				Calc.setExpression(expr);
			}
			DLock.getExpression = function(id) {
				var expressions = Calc.getState().expressions.list;
				for (var i = 0; i < expressions.length; i++) {
					if (expressions[i].id === id) return expressions[i];
				}
			}
			DLock.handler = function(e) {
				if (e.altKey && ((e.code == "KeyL") || (e.key == "l"))) {
					DLock.set();
				}
			}
			document.addEventListener('keyup', DLock.handler);
            console.log("Desmos-LockNotLock Loaded ✔️")
		} else {
			window.alert("uh oh, something went wrong")
			}
	} else {
		window.alert("this only works on desmos.com/calculator :v")
		}
}
function tryStart(){
	  if (window.Calc !== undefined) {
	    	start();
	  } else {
	    	setTimeout(tryStart, 50)
	  }
}
tryStart();
})();
