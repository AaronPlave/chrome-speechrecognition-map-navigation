var recognizer = {};


recognizer.confidence = 4; // Confidence max for accepting words

recognizer.matchEntity = function(entity, knownEntities) {
	var knownEntitiesLower = knownEntities.map(
        function(x) {
            return x.toLocaleLowerCase();
        }
    );

    // Try to match destination against all possible Entities

    // Check if destination matches any known entities
    if (knownEntities.indexOf(entity) > -1) {
        return entity;
    }
    // If no match, use levenshteinDistance to calc best score
    var best = "";
    var bestConfidence = Infinity;
    for (var i = 0; i < knownEntities.length; i++) {
        var d = knownEntitiesLower[i];
        var confidence = recognizer.levenshteinDistance(d, entity);
        var dUpper = knownEntities[i]
        if (confidence === 1) {
            // Best we can do since we've already checked for exact match
            return dUpper;
        } else {
            if (confidence < bestConfidence) {
                best = dUpper;
                bestConfidence = confidence;
            }
        }
    }
    if (bestConfidence <= recognizer.confidence && best) {
        return best;
    } else {
        return false;
    }
}

recognizer.recognize = function(unknown, commands) {
    // Attempt to recognize unknown phrase to known command
    // by using levenshteinDistance and other known properties about
    // the structure and definitions of the commands
    unknown = unknown.toLocaleLowerCase();

    var confidenceArr = [],
        wildcardExtras = [],
        grammar = Object.keys(commands),
        len = grammar.length;
    // unknownNumWords = unknown.split(" ").length;

    while (len--) {
        var rule = grammar[len];
        // Determine if the command is a wildcard command
        var wIndex = rule.indexOf(" *");
        var wildcard = false;
        var wildcardExtra = "";
        var unknownCopy = unknown;

        if (wIndex > -1) {
            // If we have a wildcard, will try matching only the number of words
            // in the phrase.
            wildcard = true;
            var splits = rule.split(" *")[0].split(" ");
            var numWordsToMatch = splits.length;
            // console.log("NUM WORDS TO MATCH ", numWordsToMatch)
            // console.log("OLD RULE", rule);
            rule = splits.slice(0, numWordsToMatch).join(" ");
            // console.log("NEW RULE", rule);

            // console.log("OLD UNKNOWN ", unknownCopy);
            unknownCopy = unknownCopy.split(" ").slice(0, numWordsToMatch).join(" ");
            // console.log("NEW UNKNOWN ", unknownCopy);

            wildcardExtra = unknown.split(" ").slice(numWordsToMatch).join(" ");
        }

        // then do more stuff in any case    
        confidenceArr[len] = recognizer.levenshteinDistance(rule, unknownCopy);
        wildcardExtras[len] = wildcardExtra;
    }
    // console.log(confidenceArr, "ca");
    var minDistance = Math.min.apply(Math, confidenceArr),
        index = confidenceArr.indexOf(minDistance);

    if (minDistance <= recognizer.confidence) {
        console.log("MIN DIST: ", minDistance);
        // console.log("IDX: ", index);
        console.log("RULE: ", grammar[index]);
        console.log("WILDCARD EXTRA: ", wildcardExtras[index]);
        // Call the appropriate handler
        return {
            rule: grammar[index],
            wildcardExtra: wildcardExtras[index]
        }
    } else {
        console.log("NO RECOGNIZED RULE MATCH");
        return false;
    }


}
recognizer.levenshteinDistance = function(s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n === 0) {
        return m;
    }
    if (m === 0) {
        return n;
    }

    var i = n;
    //Create an array of arrays in javascript (a descending loop is quicker)
    for (; i >= 0; i--) {
        d[i] = [];
    }

    // Step 2
    for (i = n; i >= 0; i--) {
        d[i][0] = i;
    }
    var j = m;
    for (; j >= 0; j--) {
        d[0][j] = j;
    }

    // Step 3
    for (i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i === j && d[i][j] > 4) {
                return n;
            }

            var t_j = t.charAt(j - 1);
            var cost = (s_i === t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi) {
                mi = b;
            }
            if (c < mi) {
                mi = c;
            }

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
}


recognizer.buildIncorrectMatches = function(target) {
    // Build database of most frequently returned incorrect matches
    // when trying to match target

    // speechCtrl.
}
