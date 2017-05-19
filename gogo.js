'use strict'
var fs = require("fs");
var request = require("request");
var obj = {};
var count = 0;
fs.readFile("./results.txt", 'utf-8',(err,data) => {
	if(err){
		console.log(err)
		return false;
	}
	var _data = data.split("/**").forEach( (item,index,array) => {
		let singleList = item.trim().split("\n");
		let namekey = singleList[singleList.length - 1].replace(/\(.+/, "").trim();
		singleList = [...singleList.slice(0, singleList.length - 2)];
		obj[namekey] = {
			rules: []
		};
		// console.log(singleList)
		let itemList = singleList.forEach((i,j) => {
			if(j === 0){
				obj[namekey]["descname"] = i.replace(/\*/, "").trim()
			}else{
				let rawlabel = i.replace(/\*/, "").trim().replace(/\<br\>/, "");
				let index = 'wrong';
				let label = rawlabel.split("=")[1];
				if(/(\d+)\=/.test(i)){
					index = RegExp.$1;
					// 调用翻译的api
					translate({
						query: label,
						obj: obj,
						key: namekey,
						index: obj[namekey].rules.length
					})
				}
				obj[namekey].rules.push({
					label,
					labelUS: "",
					index,
					rawlabel,
				})
			}
		})
	})
	console.log(JSON.stringify(obj,null,2))
})


function translate(o){
	let { type = 'baidu', from: froms = 'zh', to = 'en',
		obj, key, index,
	 query = "你好", callback = () => {} } = o;
	 // console.log(query, count)
	request.post({
		url: "http://fanyi.baidu.com/v2transapi",
		form: {
			from:"zh",
			to:"en",
			query,
			transtype:"translang",
			simple_means_flag:3,
		}
	}, function(err,httpResponse,body){
		let data = JSON.parse(body);
		delete data.liju_result.double;
		try{
			obj[key].rules[index].labelUS = data.trans_result.data[0].dst;
			writeFile(obj);
		}catch(e){
			console.log(obj[key].rules[index])
			console.log(key,index, query," ,.,.,.,.,.");
		}

	})
	count++;
}
function writeFile(obj){
	count--;
	// console.log(count, "  *************  ")
	if(count === 0){
		fs.writeFile('./resultsParsed.json', JSON.stringify(obj,null,2), 'utf-8', (err, data) => {
			if(err){
				return false;
			}
			console.log(`writeFile success!!`)
		})
	}
}

