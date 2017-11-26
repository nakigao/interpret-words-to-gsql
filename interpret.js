/**
 * Google風のメール検索クエリ生成
 *
 * @param word 検索文字列
 * @returns {*}
 */
var interpretMailSearchFormFreeWord = function(word) {
    /**
     *
     * @param input
     * @returns {Array}
     */
    var lex = function(input) {
        var tokens = [];
        var c;
        var i = 0;
        var advance = function() {
            return c = input[++i];
        };
        var addToken = function(type, value) {
            tokens.push({
                type: type,
                value: value,
            });
        };
        var isOperator = function(c) {
            return /[()]/.test(c);
        };
        var isWhiteSpace = function(c) {
            return /\s/.test(c);
        };
        var isString = function(c) {
            return typeof c === 'string' && !isOperator(c) && !isWhiteSpace(c);
        };
        var isIdentifier = function(strings) {
            return /^(in:|subject:|user:|address:|attachment:|start:|end:)$/.test(strings);
        };
        //
        while (i < input.length) {
            c = input[i];
            if (isWhiteSpace(c)) {
                advance();
            } else if (isOperator(c)) {
                addToken(c);
                advance();
            } else if (isString(c)) {
                var idn = c;
                var isBreak = false;
                while (isString(advance())) {
                    idn += c;
                    if (isIdentifier(idn)) {
                        addToken('identifier', idn);
                        isBreak = true;
                        break;
                    }
                }
                if (isBreak) {
                    advance();
                } else {
                    addToken('strings', idn);
                }
            } else {
                throw 'Unrecognized token.';
            }
        }
        addToken('(EOT)');
        return tokens;
    };
    /**
     *
     * @param tokens
     * @returns {Array}
     */
    var parse = function(tokens) {
        var interpretToken = function(token) {
            var F = function() {
            };
            var sym = new F;
            sym.type = token.type;
            sym.value = token.value;
            return sym;
        };
        var tokenIndex = 0;
        var token = function() {
            return interpretToken(tokens[tokenIndex]);
        };
        var advance = function() {
            tokenIndex++;
            return token();
        };
        var countOfBrackets = 0;
        var parseKeywords = function() {
            var keywords = [];
            while (1) {
                if (token().type === '(') {
                    countOfBrackets++;
                    advance();
                    keywords.push(parseKeywords());
                } else if (token().type === ')') {
                    countOfBrackets--;
                } else {
                    keywords.push(token().value);
                }
                // 終了判定1: カッコが閉じられている
                if (countOfBrackets <= 0) {
                    break;
                }
                // 終了判定2: 次に来るトークンが修飾子かEOT
                if (tokens[tokenIndex + 1].type === 'identifier' || tokens[tokenIndex + 1].type === '(EOT)') {
                    break;
                }
                advance();
            }
            return keywords;
        };
        /**
         * 多次元配列 -> 一次元配列
         *
         * @param arrayValue
         * @returns {Array}
         */
        var arrayMultiDimensionExpand = function(arrayValue) {
            var result = [];
            var f = function(value) {
                for (var i = 0, l = value.length; i < l; i += 1) {
                    var arrayItem = value[i];
                    if (Array.isArray(arrayItem)) {
                        f(arrayItem);
                    } else {
                        result.push(arrayItem);
                    }
                }
            };
            f(arrayValue);
            return result;
        };
        //
        var wordsOfIn = [];
        var wordsOfSubject = [];
        var wordsOfUser = [];
        var wordsOfAddress = [];
        var wordsOfAttachment = [];
        var wordsOfStart = [];
        var wordsOfEnd = [];
        var wordsOfFree = [];
        while (1) {
            if (token().type === 'identifier') {
                switch (token().value) {
                    case 'in:':
                        advance();
                        wordsOfIn.push(parseKeywords());
                        break;
                    case 'subject:':
                        advance();
                        wordsOfSubject.push(parseKeywords());
                        break;
                    case 'user:':
                        advance();
                        wordsOfUser.push(parseKeywords());
                        break;
                    case 'address:':
                        advance();
                        wordsOfAddress.push(parseKeywords());
                        break;
                    case 'attachment:':
                        advance();
                        wordsOfAttachment.push(parseKeywords());
                        break;
                    case 'start:':
                        advance();
                        wordsOfStart.push(parseKeywords());
                        break;
                    case 'end:':
                        advance();
                        wordsOfEnd.push(parseKeywords());
                        break;
                    default:
                        throw 'Unexpected token value: ' + token().value;
                }
            } else if (token().type === 'strings') {
                wordsOfFree.push(token().value);
            }
            advance();
            if (token().type === '(EOT)') {
                break;
            }
        }
        //
        return {
            'in': arrayMultiDimensionExpand(wordsOfIn),
            'subject': arrayMultiDimensionExpand(wordsOfSubject),
            'user': arrayMultiDimensionExpand(wordsOfUser),
            'address': arrayMultiDimensionExpand(wordsOfAddress),
            'attachment': arrayMultiDimensionExpand(wordsOfAttachment),
            'start': arrayMultiDimensionExpand(wordsOfStart),
            'end': arrayMultiDimensionExpand(wordsOfEnd),
            'free': arrayMultiDimensionExpand(wordsOfFree),
        };
    };
    // 実行
    try {
        return parse(lex(word));
    }
    catch (e) {
        return e;
    }
};

$(function() {

    $(document).on('click', '#submit-all', function() {
        $('form[name=search_form]').submit();
    });

    $(document).on('submit', 'form[name=search_form]', function() {
        var word = $(this).find('input[name="search_form[search_free_word]"]').val();
        var output = interpretMailSearchFormFreeWord(word);
        $(this).find('textarea').val(JSON.stringify(output));
        return false;
    });

    $('#submit-all').trigger('click');

});
