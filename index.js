#!/usr/bin/env node

/**
 * dyte-git-validator
 * validates the actual dependency verison against the given verison
 *
 * @author ansh khattar <https://anshkhattar.netlify.app>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const fs = require('fs');
const axios = require('axios');


const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;


(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);
	var filename;
	if (input.includes("-update") || input.includes("-u")) {
		filename = process.argv[5];
	}
	else {
		filename = process.argv[4];
	}
	const csvFilePath = filename
	const csv = require('csvtojson')
	csv()
		.fromFile(csvFilePath)
		.then((jsonObj) => {
		});

	const jsonArray = await csv().fromFile(csvFilePath);
	var dep = process.argv[5].split("@");
	fs.readFile(filename, 'utf8', async (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		for (var i = 0; i < jsonArray.length; i++) {
			var param = jsonArray[i].repo.split("/")[4];
			if (param[param.length - 1] == '/') {
				param = param.slice(0, param.length) - 1;
			}
			let url = `https://raw.githubusercontent.com/dyte-in/${param}/main/package.json`;
			const res = await axios.get(url);
			var depend = dep[0];
			var verCheck = dep[1];
			var temp = res.data.dependencies[depend];
			var verInit = temp.slice(1, temp.length);
			if (verCheck.localeCompare(verInit) > 0) {
				jsonArray[i].version = verInit;
				jsonArray[i].versionSatisfied = "false";
			}
			else {
				jsonArray[i].version = verInit;
				jsonArray[i].versionSatisfied = "true";
			}
		}
		//console.log(jsonArray);
		const converter = require('json-2-csv');
		converter.json2csv(jsonArray, (err, csv) => {
			if (err) {
				throw err;
			}
			fs.writeFileSync('output.csv', csv);
		});
	});
	debug && log(flags);
})();
