/* eslint no-unused-vars:0 */

// Credits:
// ========
//
// Some utils borrowed from / inspired by mongoose/utils.js
// see https://github.com/LearnBoost/mongoose
//
// HTML Entity encode / decode is based on code in node-html-to-text
// see https://github.com/werk85/node-html-to-text

const _ = require('lodash')
const inflect = require('i')()
const keystoneUtils = require('keystone-utils')

/**
 * Displays the singular or plural of a string based on a number
 * or number of items in an array.
 *
 * If arity is 1, returns the plural form of the word.
 *
 * @param {String} count
 * @param {String} singular string
 * @param {String} plural string
 * @return {String} singular or plural, * is replaced with count
 * @api public
 */
const plural = function plural (count, sn, pl) {
	if (arguments.length === 1) {
		//.{ 파라메타가 문자열 하나로써 한글인 경우 복수처리를 하지 않음
		if(typeof count == 'string' && count.match(/[^a-zA-Z]$/) != null ) return count
		//.}
		return inflect.pluralize(count)
	}
	if (typeof sn !== 'string') sn = ''
	if (!pl) pl = ( sn.match(/[a-zA-Z]$/) != null ) ? inflect.pluralize(sn) : sn	//.영문인 경우에만 복수형으로 변환

	if (typeof count === 'string') {
		count = Number(count)
	} else if (typeof count !== 'number') {
		count = Object.keys(count).length
	}
	return (count === 1 ? sn : pl).replace('*', count)
}

/**
 * Converts a key to a path. Like slug(keyToLabel(str)) but
 * optionally converts the last word to a plural.
 *
 * @param {String} key
 * @return {String}
 * @api public
 */
const keyToPath = function keyToPath (str, plural) {
	if (str && str.toString) str = str.toString()
	if (!keystoneUtils.isString(str) || !str.length) return ''									//.상속 형태로 수정
	var parts = keystoneUtils.slug(keystoneUtils.keyToLabel(str)).split('-')					//.상속 형태로 수정
	if (parts.length && plural) {
		if (parts[parts.length - 1].match(/[a-zA-Z]$/)) {										//.한글에 대한 예회처리로써 영문만 처리함
			parts[parts.length - 1] = inflect.pluralize(parts[parts.length - 1])
		}
	}
	return parts.join('-')
}

/**
 * Converts a key to a property. Like keyToPath but converts
 * to headlessCamelCase instead of dash-separated
 *
 * @param {String} key
 * @return {String}
 * @api public
 */
const keyToProperty = exports.keyToProperty = function keyToProperty (str, plural) {
	if (str && str.toString) str = str.toString()
	if (!keystoneUtils.isString(str) || !str.length) return ''									//.상속 형태로 수정
	var parts = keystoneUtils.slug(keystoneUtils.keyToLabel(str)).split('-')					//.상속 형태로 수정
	if (parts.length && plural) {
		if (parts[parts.length - 1].match(/[a-zA-Z]$/)) {										//.한글에 대한 예회처리로써 영문만 처리함
			parts[parts.length - 1] = inflect.pluralize(parts[parts.length - 1])
		}
	}
	for (var i = 1; i < parts.length; i++) {
		parts[i] = upcase(parts[i])
	}
	return parts.join('')
}

/*.
 * 한글의 받침에 따라 바뀌는 조사 처리
 * 아래로 갈수록 빈도수가 높음
 */
const pps = [
	[2, '야말로','이야말로', '(이)야말로'],
	[2, '로써','으로써', '(으)로써'],
	[2, '든지','이든지', '(이)든지'],
	[2, '라고','이라고', '(이)라고'],
	[2, '란','이란', '(이)란'],
	[2, '랑','이랑', '(이)랑'],
	[2, '여','이여', '(이)여'],

	[2, '라야','이라야', '(이)라야'],
	[2, '야','이야', '(이)야'],

	[2, '야','아'],	//'야/이야' 중에서 '야'를 overwrite

	[2, '나마','이나마', '(이)나마'],
	[2, '로서','으로서', '(으)로서'],
	[2, '라도','이라도', '(이)라도'],
	[2, '나','이나', '(이)나'],
	[2, '와','과'],
	[1, '로','으로', '(으)로'],
	[2, '가','이'],
	[2, '를','을'],
	[2, '는','은'],
]

const nums = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
const alphas = [
	'아',	//a
	'밥',	//b
	'크',	//c
	'드',	//d
	'이',	//e
	'프',	//f
	'잉',	//g
	'치',	//h
	'이',	//i
	'이',	//j
	'킥',	//k
	'엘',	//l
	'엠',	//m
	'엔',	//n
	'오',	//o
	'립',	//p
	'큐',	//q
	'르',	//r
	'스',	//s
	'트',	//t
	'유',	//u
	'브',	//v
	'유',	//w
	'스',	//x
	'이',	//y
	'즈',	//z
]

const ppz = {};
_.forEach(pps, (items) => {
	_.forEach(items, (item) => {
		if(typeof item == 'string') ppz[item] = items
	})
	ppz[items[1] + '(' + items[2] + ')'] = 
	ppz[items[2] + '(' + items[1] + ')'] = 
	ppz[items[1] + '/' + items[2]] = 
	ppz[items[2] + '/' + items[1]] = items
})

const postposition = exports.postposition = function(txt, pp) {
	if(!pp) return ''
	let josa = pp.trim()
	if(!josa || josa == '') return ''

	let i = txt.length, char
	do {
		i--
		if (i < 0) return pp						// 특수문자를 제외한 문자가 없으면
		char = txt.charAt(i)
	} while(/^[!-/|:-@|[-`|{-¿|ˆ-΅|–-〕]+$/.test(char))	// 문자열 끝자리가 특수문자이면

	// finalConsonant(종성) : 0이 아니면 받침있음
	let finalConsonant
	if(/^[0-9]+$/.test(char)) {
		// 숫자인 경우
		char = nums[char]
	}
	else if(/^[A-Z]+$/.test(char)) {
		// 영어 알파벳인 경우
		char = alphas[char.charCodeAt(0) - 0x41]
	}
	else if(/^[a-z]+$/.test(char)) {
		// 영어 알파벳인 경우
		char = alphas[char.charCodeAt(0) - 0x61]
	}
	if(/^[가-힣]+$/.test(char)) {
		let code = char.charCodeAt(0) - 44032
		// initialConsonant = 19, middleConsonant = 21, finalConsonant=28
		finalConsonant = code % 28
	}
	else if(/^[ᄀ-ᇹ|ㄱ-ㆎ]+$/.test(char)) {
		finalConsonant = 1
	}
	else {
		return pp; // 한글이 아니면
	}
	let ppInfo = ppz[josa]
	if(!ppInfo) return pp // 받침에 따라 바뀌는 조사가 아님

	// '로','으로'의 경우 앞 말이 받침 없이 끝나거나 ㄹ 받침으로 끝나면 '로', 앞 말이 ㄹ 이 아닌 받침으로 끝난다면 '으로'가 붙는다.
	let ppIdx = (finalConsonant === 8) ? ppInfo[0] : (finalConsonant ? 2 : 1)	//
	return ppInfo[ppIdx]
}

exports = module.exports = keystoneUtils
exports.moment = require('moment') // 날짜 관련 유틸리티
exports.plural = plural
exports.keyToPath = keyToPath
exports.withPostposition = (txt, pp) => txt + postposition(txt, pp)
