/**
 * Static utility function for training and testing classifiers.
 * 
 * @author Erel Segal-Halevi
 * @since 2013-06
 */

var hash = require('./hash');
var PrecisionRecall = require("./PrecisionRecall");

/**
 * Test the given classifier on the given test-set.
 * @param classifier a (trained) classifier.
 * @param testSet array with objects of the format: {input: "sample1", output: "class1"}
 * @param verbosity [int] level of details in log (0 = no log)
 * @param microAverage, macroSum [optional; output] - objects of type PrecisionRecall, used to return the results. 
 * @return the currentStats.
 */
module.exports.test = function(
		classifier, testSet, 
		verbosity, microAverage, macroSum) {
		var currentStats = new PrecisionRecall();
		for (var i=0; i<testSet.length; ++i) {
			var expectedClasses = testSet[i].output;
			var actualClasses = classifier.classify(testSet[i].input);
			if (verbosity>1) console.log("\n"+testSet[i].input+": ");
			currentStats.addCases(expectedClasses, actualClasses, verbosity-1);
			if (microAverage) microAverage.addCases(expectedClasses, actualClasses, 0);
		}
		currentStats.calculateStats();
		if (macroSum) hash.add(macroSum, currentStats.fullStats());
		
		if (verbosity>0) {
			if (verbosity>1) {
				console.log("FULL RESULTS:")
				console.dir(currentStats.fullStats());
			}
			console.log("SUMMARY: "+currentStats.shortStats()+"\n");
		}
		
		return currentStats;
};

/**
 * Test the given classifier on the given train-set and test-set.
 * @param createNewClassifierFunction a function that creates a new, empty, untrained classifier (of type BinaryClassifierSet).
 * @param trainSet, testSet arrays with objects of the format: {input: "sample1", output: "class1"}
 * @param verbosity [int] level of details in log (0 = no log)
 * @param microAverage, macroSum [output] - objects of type PrecisionRecall, used to return the results. 
 * @return the currentStats.
 */
module.exports.trainAndTest = function(
		createNewClassifierFunction, 
		trainSet, testSet, 
		verbosity, microAverage, macroSum) {
		// TRAIN:
		var classifier = createNewClassifierFunction();
		//classifier.addClasses(trainSet.allClasses); // not needed - handled by trainBatch
		if (verbosity>0) console.log("\nstart training on "+trainSet.length+" samples, "+(trainSet.allClasses? trainSet.allClasses.length+' classes': ''));
		var startTime = new Date()
		if (verbosity>2) console.dir(trainSet);
		classifier.trainBatch(trainSet);
		var elapsedTime = new Date()-startTime;
		if (verbosity>0) console.log("end training on "+trainSet.length+" samples, "+(trainSet.allClasses? trainSet.allClasses.length+' classes, ': '')+elapsedTime+" [ms]");
	
		// TEST:
		return module.exports.test(classifier, testSet, verbosity, microAverage, macroSum);
};