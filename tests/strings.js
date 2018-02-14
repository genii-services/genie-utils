/* eslint-env node, mocha */

var demand = require('must');
var utils = require('../index');

describe('String transform', function () {
	describe('postposition', function () {
		it('Should transform "한글,을" to "한글을" ', function () {
			demand(utils.postposition('한글', '을')).to.equal('한글을');
		});
		it('Should transform "영어,을" to "영어를"', function () {
			demand(utils.postposition('영어', '을')).to.equal('영어를');
		});
		it('Should transform "Korean,을" to "Korean을"', function () {
			demand(utils.postposition('Korean','을')).to.equal('Korean을');
		});
	});
});
