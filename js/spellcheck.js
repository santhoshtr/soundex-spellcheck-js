(function() {

	var root = this,
		previous_spellcheck = root.spellcheck;


	var spellcheck = function(corpus) {
		var dictionary = [];

		function add(word) {
			dictionary.push(word.toLowerCase());
		}

		function train(corpus) {
			var match, word;
			regex = /\S+/g;
			corpus = corpus.toLowerCase();
			while ((match = regex.exec(corpus))) {
				word = match[0];
				add(word);
			}
		}


		function check(word) {
			var s = soundex();
			for (var index in dictionary) {
				var item = dictionary[index];
				result = s.compare(word, item);
				if (result >= 0) {
					return result;
				}
			}
			return -1;

		}

		function suggestion(word) {
			var s = soundex();
			var suggestions = [];
			for (var index in dictionary) {
				var item = dictionary[index];
				result = s.compare(word, item);
				if (result >= 0) {
					suggestions.push(item);
				} else if (levenshtein(s.get(item), s.get(word)) <= 2) {
					suggestions.push(item);
				}
			}
			return suggestions;
		}

		train(corpus);

		return {
			check: check,
			suggestions: suggestion,
			dictionary: dictionary
		};
	};
	//http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
	function levenshtein(s, t) {
		var d = []; //2d matrix

		// Step 1
		var n = s.length;
		var m = t.length;

		if (n == 0) return m;
		if (m == 0) return n;

		//Create an array of arrays in javascript (a descending loop is quicker)
		for (var i = n; i >= 0; i--) d[i] = [];

		// Step 2
		for (var i = n; i >= 0; i--) d[i][0] = i;
		for (var j = m; j >= 0; j--) d[0][j] = j;

		// Step 3
		for (var i = 1; i <= n; i++) {
			var s_i = s.charAt(i - 1);

			// Step 4
			for (var j = 1; j <= m; j++) {

				//Check the jagged ld total so far
				if (i == j && d[i][j] > 4) return n;

				var t_j = t.charAt(j - 1);
				var cost = (s_i == t_j) ? 0 : 1; // Step 5

				//Calculate the minimum
				var mi = d[i - 1][j] + 1;
				var b = d[i][j - 1] + 1;
				var c = d[i - 1][j - 1] + cost;

				if (b < mi) mi = b;
				if (c < mi) mi = c;

				d[i][j] = mi; // Step 6

				//Damerau transposition
				if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
					d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
				}
			}
		}

		// Step 7
		return d[n][m];
	}
	if (typeof exports !== 'undefined') { // nodejs
		spellcheck.platform = {
			name: 'node.js',
			version: process.version
		};
		spellcheck.version = JSON.parse(
			require('fs').readFileSync(__dirname + '/package.json')).version;
		spellcheck.path = __dirname;
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = spellcheck;
		}
		exports.spellcheck = spellcheck;
	} else { // browser
		// browser detection is possible in the future
		spellcheck.platform = {
			name: 'browser'
		};
		spellcheck.version = '0.0.3';
		if (typeof define === 'function' && define.amd) {
			define('spellcheck', function() {
				return spellcheck;
			});
		} else {
			root.spellcheck = spellcheck;
		}
	}
})();