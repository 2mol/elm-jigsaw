(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.bk.aF === region.bx.aF)
	{
		return 'on line ' + region.bk.aF;
	}
	return 'on lines ' + region.bk.aF + ' through ' + region.bx.aF;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.cj,
		impl.cz,
		impl.cx,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		T: func(record.T),
		bl: record.bl,
		bg: record.bg
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.T;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.bl;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.bg) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.cj,
		impl.cz,
		impl.cx,
		function(sendToApp, initialModel) {
			var view = impl.cA;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.cj,
		impl.cz,
		impl.cx,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.bj && impl.bj(sendToApp)
			var view = impl.cA;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.ca);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.cy) && (_VirtualDom_doc.title = title = doc.cy);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.cr;
	var onUrlRequest = impl.cs;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		bj: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.bT === next.bT
							&& curr.bC === next.bC
							&& curr.bQ.a === next.bQ.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		cj: function(flags)
		{
			return A3(impl.cj, flags, _Browser_getUrl(), key);
		},
		cA: impl.cA,
		cz: impl.cz,
		cx: impl.cx
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { ch: 'hidden', cb: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { ch: 'mozHidden', cb: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { ch: 'msHidden', cb: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { ch: 'webkitHidden', cb: 'webkitvisibilitychange' }
		: { ch: 'hidden', cb: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		bY: _Browser_getScene(),
		b3: {
			b5: _Browser_window.pageXOffset,
			b6: _Browser_window.pageYOffset,
			b4: _Browser_doc.documentElement.clientWidth,
			bB: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		b4: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		bB: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			bY: {
				b4: node.scrollWidth,
				bB: node.scrollHeight
			},
			b3: {
				b5: node.scrollLeft,
				b6: node.scrollTop,
				b4: node.clientWidth,
				bB: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			bY: _Browser_getScene(),
			b3: {
				b5: x,
				b6: y,
				b4: _Browser_doc.documentElement.clientWidth,
				bB: _Browser_doc.documentElement.clientHeight
			},
			ce: {
				b5: x + rect.left,
				b6: y + rect.top,
				b4: rect.width,
				bB: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.k) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.n),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.n);
		} else {
			var treeLen = builder.k * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.o) : builder.o;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.k);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.n) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.n);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{o: nodeList, k: (len / $elm$core$Array$branchFactor) | 0, n: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {bA: fragment, bC: host, bO: path, bQ: port_, bT: protocol, bU: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$document = _Browser_document;
var $author$project$Voronoi$DraggingNothing = {$: 0};
var $author$project$Voronoi$Init = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$random$Random$Generator = $elm$core$Basics$identity;
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$random$Random$Seed = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm$random$Random$next = function (_v0) {
	var state0 = _v0.a;
	var incr = _v0.b;
	return A2($elm$random$Random$Seed, ((state0 * 1664525) + incr) >>> 0, incr);
};
var $elm$core$Bitwise$xor = _Bitwise_xor;
var $elm$random$Random$peel = function (_v0) {
	var state = _v0.a;
	var word = (state ^ (state >>> ((state >>> 28) + 4))) * 277803737;
	return ((word >>> 22) ^ word) >>> 0;
};
var $elm$random$Random$int = F2(
	function (a, b) {
		return function (seed0) {
			var _v0 = (_Utils_cmp(a, b) < 0) ? _Utils_Tuple2(a, b) : _Utils_Tuple2(b, a);
			var lo = _v0.a;
			var hi = _v0.b;
			var range = (hi - lo) + 1;
			if (!((range - 1) & range)) {
				return _Utils_Tuple2(
					(((range - 1) & $elm$random$Random$peel(seed0)) >>> 0) + lo,
					$elm$random$Random$next(seed0));
			} else {
				var threshhold = (((-range) >>> 0) % range) >>> 0;
				var accountForBias = function (seed) {
					accountForBias:
					while (true) {
						var x = $elm$random$Random$peel(seed);
						var seedN = $elm$random$Random$next(seed);
						if (_Utils_cmp(x, threshhold) < 0) {
							var $temp$seed = seedN;
							seed = $temp$seed;
							continue accountForBias;
						} else {
							return _Utils_Tuple2((x % range) + lo, seedN);
						}
					}
				};
				return accountForBias(seed0);
			}
		};
	});
var $elm$random$Random$listHelp = F4(
	function (revList, n, gen, seed) {
		listHelp:
		while (true) {
			if (n < 1) {
				return _Utils_Tuple2(revList, seed);
			} else {
				var _v0 = gen(seed);
				var value = _v0.a;
				var newSeed = _v0.b;
				var $temp$revList = A2($elm$core$List$cons, value, revList),
					$temp$n = n - 1,
					$temp$gen = gen,
					$temp$seed = newSeed;
				revList = $temp$revList;
				n = $temp$n;
				gen = $temp$gen;
				seed = $temp$seed;
				continue listHelp;
			}
		}
	});
var $elm$random$Random$list = F2(
	function (n, _v0) {
		var gen = _v0;
		return function (seed) {
			return A4($elm$random$Random$listHelp, _List_Nil, n, gen, seed);
		};
	});
var $elm$random$Random$map = F2(
	function (func, _v0) {
		var genA = _v0;
		return function (seed0) {
			var _v1 = genA(seed0);
			var a = _v1.a;
			var seed1 = _v1.b;
			return _Utils_Tuple2(
				func(a),
				seed1);
		};
	});
var $author$project$Voronoi$genXCoordinates = function (n) {
	return A2(
		A2($elm$core$Basics$composeL, $elm$random$Random$map, $elm$core$List$map),
		$elm$core$Basics$toFloat,
		A2(
			$elm$random$Random$list,
			n,
			A2($elm$random$Random$int, 0, 800)));
};
var $author$project$Voronoi$genYCoordinates = function (n) {
	return A2(
		A2($elm$core$Basics$composeL, $elm$random$Random$map, $elm$core$List$map),
		$elm$core$Basics$toFloat,
		A2(
			$elm$random$Random$list,
			n,
			A2($elm$random$Random$int, 0, 600)));
};
var $elm$random$Random$map2 = F3(
	function (func, _v0, _v1) {
		var genA = _v0;
		var genB = _v1;
		return function (seed0) {
			var _v2 = genA(seed0);
			var a = _v2.a;
			var seed1 = _v2.b;
			var _v3 = genB(seed1);
			var b = _v3.a;
			var seed2 = _v3.b;
			return _Utils_Tuple2(
				A2(func, a, b),
				seed2);
		};
	});
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $elm_community$list_extra$List$Extra$zip = $elm$core$List$map2($elm$core$Tuple$pair);
var $author$project$Voronoi$genXYCoordinates = function (n) {
	return A3(
		$elm$random$Random$map2,
		$elm_community$list_extra$List$Extra$zip,
		$author$project$Voronoi$genXCoordinates(n),
		$author$project$Voronoi$genYCoordinates(n));
};
var $elm$random$Random$Generate = $elm$core$Basics$identity;
var $elm$random$Random$initialSeed = function (x) {
	var _v0 = $elm$random$Random$next(
		A2($elm$random$Random$Seed, 0, 1013904223));
	var state1 = _v0.a;
	var incr = _v0.b;
	var state2 = (state1 + x) >>> 0;
	return $elm$random$Random$next(
		A2($elm$random$Random$Seed, state2, incr));
};
var $elm$time$Time$Name = function (a) {
	return {$: 0, a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 1, a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0;
	return millis;
};
var $elm$random$Random$init = A2(
	$elm$core$Task$andThen,
	function (time) {
		return $elm$core$Task$succeed(
			$elm$random$Random$initialSeed(
				$elm$time$Time$posixToMillis(time)));
	},
	$elm$time$Time$now);
var $elm$random$Random$step = F2(
	function (_v0, seed) {
		var generator = _v0;
		return generator(seed);
	});
var $elm$random$Random$onEffects = F3(
	function (router, commands, seed) {
		if (!commands.b) {
			return $elm$core$Task$succeed(seed);
		} else {
			var generator = commands.a;
			var rest = commands.b;
			var _v1 = A2($elm$random$Random$step, generator, seed);
			var value = _v1.a;
			var newSeed = _v1.b;
			return A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$random$Random$onEffects, router, rest, newSeed);
				},
				A2($elm$core$Platform$sendToApp, router, value));
		}
	});
var $elm$random$Random$onSelfMsg = F3(
	function (_v0, _v1, seed) {
		return $elm$core$Task$succeed(seed);
	});
var $elm$random$Random$cmdMap = F2(
	function (func, _v0) {
		var generator = _v0;
		return A2($elm$random$Random$map, func, generator);
	});
_Platform_effectManagers['Random'] = _Platform_createManager($elm$random$Random$init, $elm$random$Random$onEffects, $elm$random$Random$onSelfMsg, $elm$random$Random$cmdMap);
var $elm$random$Random$command = _Platform_leaf('Random');
var $elm$random$Random$generate = F2(
	function (tagger, generator) {
		return $elm$random$Random$command(
			A2($elm$random$Random$map, tagger, generator));
	});
var $author$project$Voronoi$init = function (_v0) {
	return _Utils_Tuple2(
		{bv: 'empty', H: $author$project$Voronoi$DraggingNothing, J: $elm$core$Dict$empty, bL: 100, Y: $elm$core$Array$empty},
		A2(
			$elm$random$Random$generate,
			$author$project$Voronoi$Init,
			$author$project$Voronoi$genXYCoordinates(150)));
};
var $author$project$Voronoi$DragMoving = F4(
	function (a, b, c, d) {
		return {$: 3, a: a, b: b, c: c, d: d};
	});
var $author$project$Voronoi$DragStop = {$: 4};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $author$project$Voronoi$decodeButtonZombieDrag = A2(
	$elm$json$Json$Decode$field,
	'buttons',
	A2(
		$elm$json$Json$Decode$map,
		function (buttons) {
			return buttons === 1;
		},
		$elm$json$Json$Decode$int));
var $elm$json$Json$Decode$map3 = _Json_map3;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $elm$browser$Browser$Events$Document = 0;
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {bP: pids, b$: subs};
	});
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (!node) {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {bz: event, bD: key};
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (!node) {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.bP,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var key = _v0.bD;
		var event = _v0.bz;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.b$);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onMouseMove = A2($elm$browser$Browser$Events$on, 0, 'mousemove');
var $elm$browser$Browser$Events$onMouseUp = A2($elm$browser$Browser$Events$on, 0, 'mouseup');
var $author$project$Voronoi$subscriptions = function (model) {
	var _v0 = model.H;
	if (!_v0.$) {
		return $elm$core$Platform$Sub$none;
	} else {
		var idx = _v0.a;
		return $elm$core$Platform$Sub$batch(
			_List_fromArray(
				[
					$elm$browser$Browser$Events$onMouseMove(
					A4(
						$elm$json$Json$Decode$map3,
						$author$project$Voronoi$DragMoving(idx),
						$author$project$Voronoi$decodeButtonZombieDrag,
						A2($elm$json$Json$Decode$field, 'pageX', $elm$json$Json$Decode$int),
						A2($elm$json$Json$Decode$field, 'pageY', $elm$json$Json$Decode$int))),
					$elm$browser$Browser$Events$onMouseUp(
					$elm$json$Json$Decode$succeed($author$project$Voronoi$DragStop))
				]));
	}
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Voronoi$DraggingMarker = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $author$project$Voronoi$Oneway = 0;
var $author$project$Voronoi$Theotherway = 1;
var $elm$core$Array$fromListHelp = F3(
	function (list, nodeList, nodeListSize) {
		fromListHelp:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, list);
			var jsArray = _v0.a;
			var remainingItems = _v0.b;
			if (_Utils_cmp(
				$elm$core$Elm$JsArray$length(jsArray),
				$elm$core$Array$branchFactor) < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					true,
					{o: nodeList, k: nodeListSize, n: jsArray});
			} else {
				var $temp$list = remainingItems,
					$temp$nodeList = A2(
					$elm$core$List$cons,
					$elm$core$Array$Leaf(jsArray),
					nodeList),
					$temp$nodeListSize = nodeListSize + 1;
				list = $temp$list;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue fromListHelp;
			}
		}
	});
var $elm$core$Array$fromList = function (list) {
	if (!list.b) {
		return $elm$core$Array$empty;
	} else {
		return A3($elm$core$Array$fromListHelp, list, _List_Nil, 0);
	}
};
var $elm$core$Array$bitMask = 4294967295 >>> (32 - $elm$core$Array$shiftStep);
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Elm$JsArray$unsafeGet = _JsArray_unsafeGet;
var $elm$core$Array$getHelp = F3(
	function (shift, index, tree) {
		getHelp:
		while (true) {
			var pos = $elm$core$Array$bitMask & (index >>> shift);
			var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!_v0.$) {
				var subTree = _v0.a;
				var $temp$shift = shift - $elm$core$Array$shiftStep,
					$temp$index = index,
					$temp$tree = subTree;
				shift = $temp$shift;
				index = $temp$index;
				tree = $temp$tree;
				continue getHelp;
			} else {
				var values = _v0.a;
				return A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, values);
			}
		}
	});
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Array$tailIndex = function (len) {
	return (len >>> 5) << 5;
};
var $elm$core$Array$get = F2(
	function (index, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? $elm$core$Maybe$Nothing : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? $elm$core$Maybe$Just(
			A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, tail)) : $elm$core$Maybe$Just(
			A3($elm$core$Array$getHelp, startShift, index, tree)));
	});
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Elm$JsArray$unsafeSet = _JsArray_unsafeSet;
var $elm$core$Array$setHelp = F4(
	function (shift, index, value, tree) {
		var pos = $elm$core$Array$bitMask & (index >>> shift);
		var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
		if (!_v0.$) {
			var subTree = _v0.a;
			var newSub = A4($elm$core$Array$setHelp, shift - $elm$core$Array$shiftStep, index, value, subTree);
			return A3(
				$elm$core$Elm$JsArray$unsafeSet,
				pos,
				$elm$core$Array$SubTree(newSub),
				tree);
		} else {
			var values = _v0.a;
			var newLeaf = A3($elm$core$Elm$JsArray$unsafeSet, $elm$core$Array$bitMask & index, value, values);
			return A3(
				$elm$core$Elm$JsArray$unsafeSet,
				pos,
				$elm$core$Array$Leaf(newLeaf),
				tree);
		}
	});
var $elm$core$Array$set = F3(
	function (index, value, array) {
		var len = array.a;
		var startShift = array.b;
		var tree = array.c;
		var tail = array.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? array : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			tree,
			A3($elm$core$Elm$JsArray$unsafeSet, $elm$core$Array$bitMask & index, value, tail)) : A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			A4($elm$core$Array$setHelp, startShift, index, value, tree),
			tail));
	});
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $elm_community$list_extra$List$Extra$uniqueHelp = F4(
	function (f, existing, remaining, accumulator) {
		uniqueHelp:
		while (true) {
			if (!remaining.b) {
				return $elm$core$List$reverse(accumulator);
			} else {
				var first = remaining.a;
				var rest = remaining.b;
				var computedFirst = f(first);
				if (A2($elm$core$List$member, computedFirst, existing)) {
					var $temp$f = f,
						$temp$existing = existing,
						$temp$remaining = rest,
						$temp$accumulator = accumulator;
					f = $temp$f;
					existing = $temp$existing;
					remaining = $temp$remaining;
					accumulator = $temp$accumulator;
					continue uniqueHelp;
				} else {
					var $temp$f = f,
						$temp$existing = A2($elm$core$List$cons, computedFirst, existing),
						$temp$remaining = rest,
						$temp$accumulator = A2($elm$core$List$cons, first, accumulator);
					f = $temp$f;
					existing = $temp$existing;
					remaining = $temp$remaining;
					accumulator = $temp$accumulator;
					continue uniqueHelp;
				}
			}
		}
	});
var $elm_community$list_extra$List$Extra$unique = function (list) {
	return A4($elm_community$list_extra$List$Extra$uniqueHelp, $elm$core$Basics$identity, _List_Nil, list, _List_Nil);
};
var $author$project$Voronoi$updateModel = F2(
	function (msg, model) {
		switch (msg.$) {
			case 1:
				var coord = msg.a;
				return _Utils_update(
					model,
					{
						Y: $elm$core$Array$fromList(
							$elm_community$list_extra$List$Extra$unique(coord))
					});
			case 2:
				var idx = msg.a;
				return _Utils_update(
					model,
					{
						H: A2($author$project$Voronoi$DraggingMarker, idx, $elm$core$Maybe$Nothing)
					});
			case 4:
				return _Utils_update(
					model,
					{H: $author$project$Voronoi$DraggingNothing});
			case 3:
				var idx = msg.a;
				var isDown = msg.b;
				var x = msg.c;
				var y = msg.d;
				if (isDown) {
					var dragState = function () {
						var _v3 = model.H;
						if ((_v3.$ === 1) && (_v3.b.$ === 1)) {
							var _v4 = _v3.b;
							return A2(
								$author$project$Voronoi$DraggingMarker,
								idx,
								A2(
									$elm$core$Maybe$map,
									function (_v5) {
										var px = _v5.a;
										var py = _v5.b;
										return _Utils_Tuple2(x - px, y - py);
									},
									A2($elm$core$Array$get, idx, model.Y)));
						} else {
							return model.H;
						}
					}();
					return _Utils_update(
						model,
						{
							H: dragState,
							Y: function () {
								if ((dragState.$ === 1) && (!dragState.b.$)) {
									var _v2 = dragState.b.a;
									var offsetX = _v2.a;
									var offsetY = _v2.b;
									return A3(
										$elm$core$Array$set,
										idx,
										_Utils_Tuple2(x - offsetX, y - offsetY),
										model.Y);
								} else {
									return model.Y;
								}
							}()
						});
				} else {
					return _Utils_update(
						model,
						{H: $author$project$Voronoi$DraggingNothing});
				}
			case 5:
				var midpointCoordinates = msg.a;
				var currentState = A2($elm$core$Dict$get, midpointCoordinates, model.J);
				var newEdgeTongues = function () {
					if (!currentState.$) {
						if (!currentState.a) {
							var _v7 = currentState.a;
							return A3($elm$core$Dict$insert, midpointCoordinates, 1, model.J);
						} else {
							var _v8 = currentState.a;
							return A2($elm$core$Dict$remove, midpointCoordinates, model.J);
						}
					} else {
						return A3($elm$core$Dict$insert, midpointCoordinates, 0, model.J);
					}
				}();
				return _Utils_update(
					model,
					{J: newEdgeTongues});
			default:
				return model;
		}
	});
var $author$project$Voronoi$update = F2(
	function (msg, model) {
		return _Utils_Tuple2(
			A2($author$project$Voronoi$updateModel, msg, model),
			$elm$core$Platform$Cmd$none);
	});
var $ianmackenzie$elm_geometry$Geometry$Types$CubicSpline2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$CubicSpline2d$fromControlPoints = F4(
	function (p1, p2, p3, p4) {
		return {al: p1, am: p4, aI: p2, aL: p3};
	});
var $ianmackenzie$elm_geometry$CubicSpline2d$firstControlPoint = function (_v0) {
	var spline = _v0;
	return spline.al;
};
var $ianmackenzie$elm_geometry$CubicSpline2d$fourthControlPoint = function (_v0) {
	var spline = _v0;
	return spline.am;
};
var $ianmackenzie$elm_geometry$CubicSpline2d$secondControlPoint = function (_v0) {
	var spline = _v0;
	return spline.aI;
};
var $ianmackenzie$elm_geometry$CubicSpline2d$thirdControlPoint = function (_v0) {
	var spline = _v0;
	return spline.aL;
};
var $ianmackenzie$elm_geometry$CubicSpline2d$mapControlPoints = F2(
	function (_function, spline) {
		return A4(
			$ianmackenzie$elm_geometry$CubicSpline2d$fromControlPoints,
			_function(
				$ianmackenzie$elm_geometry$CubicSpline2d$firstControlPoint(spline)),
			_function(
				$ianmackenzie$elm_geometry$CubicSpline2d$secondControlPoint(spline)),
			_function(
				$ianmackenzie$elm_geometry$CubicSpline2d$thirdControlPoint(spline)),
			_function(
				$ianmackenzie$elm_geometry$CubicSpline2d$fourthControlPoint(spline)));
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Point2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Point2d$mirrorAcross = F2(
	function (_v0, _v1) {
		var axis = _v0;
		var p = _v1;
		var _v2 = axis.D;
		var p0 = _v2;
		var deltaX = p.b5 - p0.b5;
		var deltaY = p.b6 - p0.b6;
		var _v3 = axis.B;
		var d = _v3;
		var a = 1 - ((2 * d.b6) * d.b6);
		var b = (2 * d.b5) * d.b6;
		var c = 1 - ((2 * d.b5) * d.b5);
		return {b5: (p0.b5 + (a * deltaX)) + (b * deltaY), b6: (p0.b6 + (b * deltaX)) + (c * deltaY)};
	});
var $ianmackenzie$elm_geometry$CubicSpline2d$mirrorAcross = F2(
	function (axis, spline) {
		return A2(
			$ianmackenzie$elm_geometry$CubicSpline2d$mapControlPoints,
			$ianmackenzie$elm_geometry$Point2d$mirrorAcross(axis),
			spline);
	});
var $ianmackenzie$elm_geometry$Point2d$translateBy = F2(
	function (_v0, _v1) {
		var v = _v0;
		var p = _v1;
		return {b5: p.b5 + v.b5, b6: p.b6 + v.b6};
	});
var $ianmackenzie$elm_geometry$CubicSpline2d$translateBy = F2(
	function (displacement, spline) {
		return A2(
			$ianmackenzie$elm_geometry$CubicSpline2d$mapControlPoints,
			$ianmackenzie$elm_geometry$Point2d$translateBy(displacement),
			spline);
	});
var $ianmackenzie$elm_geometry$Point2d$unitless = F2(
	function (x, y) {
		return {b5: x, b6: y};
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Vector2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Vector2d$unitless = F2(
	function (x, y) {
		return {b5: x, b6: y};
	});
var $ianmackenzie$elm_geometry$Point2d$origin = {b5: 0, b6: 0};
var $ianmackenzie$elm_geometry$Geometry$Types$Axis2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Axis2d$through = F2(
	function (givenPoint, givenDirection) {
		return {B: givenDirection, D: givenPoint};
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Direction2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Direction2d$positiveY = {b5: 0, b6: 1};
var $ianmackenzie$elm_geometry$Direction2d$y = $ianmackenzie$elm_geometry$Direction2d$positiveY;
var $ianmackenzie$elm_geometry$Axis2d$y = A2($ianmackenzie$elm_geometry$Axis2d$through, $ianmackenzie$elm_geometry$Point2d$origin, $ianmackenzie$elm_geometry$Direction2d$y);
var $author$project$Voronoi$baseWiggly = function () {
	var baseShape = A4(
		$ianmackenzie$elm_geometry$CubicSpline2d$fromControlPoints,
		A2($ianmackenzie$elm_geometry$Point2d$unitless, 50, 120),
		A2($ianmackenzie$elm_geometry$Point2d$unitless, 200, 120),
		A2($ianmackenzie$elm_geometry$Point2d$unitless, 60, 70),
		A2($ianmackenzie$elm_geometry$Point2d$unitless, 150, 70));
	var mirroredBaseShape = A2(
		$ianmackenzie$elm_geometry$CubicSpline2d$translateBy,
		A2($ianmackenzie$elm_geometry$Vector2d$unitless, 300, 0),
		A2($ianmackenzie$elm_geometry$CubicSpline2d$mirrorAcross, $ianmackenzie$elm_geometry$Axis2d$y, baseShape));
	return _Utils_Tuple2(baseShape, mirroredBaseShape);
}();
var $elm$svg$Svg$Attributes$fillOpacity = _VirtualDom_attribute('fill-opacity');
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$g = $elm$svg$Svg$trustedNode('g');
var $elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm_community$list_extra$List$Extra$andThen = $elm$core$List$concatMap;
var $elm_community$list_extra$List$Extra$lift2 = F3(
	function (f, la, lb) {
		return A2(
			$elm_community$list_extra$List$Extra$andThen,
			function (a) {
				return A2(
					$elm_community$list_extra$List$Extra$andThen,
					function (b) {
						return _List_fromArray(
							[
								A2(f, a, b)
							]);
					},
					lb);
			},
			la);
	});
var $elm$svg$Svg$rect = $elm$svg$Svg$trustedNode('rect');
var $elm$svg$Svg$Attributes$stroke = _VirtualDom_attribute('stroke');
var $elm$svg$Svg$Attributes$strokeWidth = _VirtualDom_attribute('stroke-width');
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$Attributes$fill = _VirtualDom_attribute('fill');
var $elm$core$Basics$modBy = _Basics_modBy;
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var $elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var $author$project$Voronoi$tile = F3(
	function (size, xc, yc) {
		var col = (!A2($elm$core$Basics$modBy, 2, xc + yc)) ? '#eeeeee' : '#ffffff';
		return A2(
			$elm$svg$Svg$rect,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$x(
					$elm$core$String$fromInt(xc * size)),
					$elm$svg$Svg$Attributes$y(
					$elm$core$String$fromInt(yc * size)),
					$elm$svg$Svg$Attributes$width(
					$elm$core$String$fromInt(size)),
					$elm$svg$Svg$Attributes$height(
					$elm$core$String$fromInt(size)),
					$elm$svg$Svg$Attributes$fill(col)
				]),
			_List_Nil);
	});
var $elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var $author$project$Voronoi$canvas = F3(
	function (w, h, children) {
		var wStr = $elm$core$String$fromInt(w);
		var tileSize = 10;
		var xnumtiles = (w / tileSize) | 0;
		var ynumtiles = (h / tileSize) | 0;
		var tiles = A3(
			$elm_community$list_extra$List$Extra$lift2,
			$author$project$Voronoi$tile(tileSize),
			A2($elm$core$List$range, 0, xnumtiles - 1),
			A2($elm$core$List$range, 0, ynumtiles - 1));
		var hStr = $elm$core$String$fromInt(h);
		var border = A2(
			$elm$svg$Svg$rect,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$x('0'),
					$elm$svg$Svg$Attributes$y('0'),
					$elm$svg$Svg$Attributes$width(wStr),
					$elm$svg$Svg$Attributes$height(hStr),
					$elm$svg$Svg$Attributes$stroke('black'),
					$elm$svg$Svg$Attributes$strokeWidth('2'),
					$elm$svg$Svg$Attributes$fillOpacity('0')
				]),
			_List_Nil);
		return A2(
			$elm$svg$Svg$svg,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$width(wStr),
					$elm$svg$Svg$Attributes$height(hStr),
					$elm$svg$Svg$Attributes$viewBox('0 0 ' + (wStr + (' ' + hStr)))
				]),
			_List_fromArray(
				[
					A2($elm$svg$Svg$g, _List_Nil, tiles),
					border,
					A2($elm$svg$Svg$g, _List_Nil, children)
				]));
	});
var $author$project$Voronoi$ToggleEdgeTongue = function (a) {
	return {$: 5, a: a};
};
var $ianmackenzie$elm_geometry$LineSegment2d$endpoints = function (_v0) {
	var endpoints_ = _v0;
	return endpoints_;
};
var $ianmackenzie$elm_geometry$Point2d$interpolateFrom = F3(
	function (_v0, _v1, t) {
		var p1 = _v0;
		var p2 = _v1;
		return (t <= 0.5) ? {b5: p1.b5 + (t * (p2.b5 - p1.b5)), b6: p1.b6 + (t * (p2.b6 - p1.b6))} : {b5: p2.b5 + ((1 - t) * (p1.b5 - p2.b5)), b6: p2.b6 + ((1 - t) * (p1.b6 - p2.b6))};
	});
var $ianmackenzie$elm_geometry$LineSegment2d$interpolate = F2(
	function (lineSegment, t) {
		var _v0 = $ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
		var start = _v0.a;
		var end = _v0.b;
		return A3($ianmackenzie$elm_geometry$Point2d$interpolateFrom, start, end, t);
	});
var $ianmackenzie$elm_geometry$LineSegment2d$midpoint = function (lineSegment) {
	return A2($ianmackenzie$elm_geometry$LineSegment2d$interpolate, lineSegment, 0.5);
};
var $elm$core$Basics$round = _Basics_round;
var $ianmackenzie$elm_geometry$Point2d$toUnitless = function (_v0) {
	var pointCoordinates = _v0;
	return pointCoordinates;
};
var $author$project$Voronoi$lineCoord = function (lineSegment) {
	return function (_v0) {
		var x = _v0.b5;
		var y = _v0.b6;
		return _Utils_Tuple2(
			$elm$core$Basics$round(x),
			$elm$core$Basics$round(y));
	}(
		$ianmackenzie$elm_geometry$Point2d$toUnitless(
			$ianmackenzie$elm_geometry$LineSegment2d$midpoint(lineSegment)));
};
var $elm$core$String$fromFloat = _String_fromNumber;
var $ianmackenzie$elm_geometry$Point2d$unwrap = function (_v0) {
	var pointCoordinates = _v0;
	return pointCoordinates;
};
var $ianmackenzie$elm_geometry_svg$Geometry$Svg$coordinatesString = function (point) {
	var _v0 = $ianmackenzie$elm_geometry$Point2d$unwrap(point);
	var x = _v0.b5;
	var y = _v0.b6;
	return $elm$core$String$fromFloat(x) + (',' + $elm$core$String$fromFloat(y));
};
var $elm$svg$Svg$Attributes$points = _VirtualDom_attribute('points');
var $ianmackenzie$elm_geometry_svg$Geometry$Svg$pointsAttribute = function (points) {
	return $elm$svg$Svg$Attributes$points(
		A2(
			$elm$core$String$join,
			' ',
			A2($elm$core$List$map, $ianmackenzie$elm_geometry_svg$Geometry$Svg$coordinatesString, points)));
};
var $elm$svg$Svg$polyline = $elm$svg$Svg$trustedNode('polyline');
var $ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d = F2(
	function (attributes, lineSegment) {
		var _v0 = $ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
		var p1 = _v0.a;
		var p2 = _v0.b;
		return A2(
			$elm$svg$Svg$polyline,
			A2(
				$elm$core$List$cons,
				$ianmackenzie$elm_geometry_svg$Geometry$Svg$pointsAttribute(
					_List_fromArray(
						[p1, p2])),
				attributes),
			_List_Nil);
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	});
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$svg$Svg$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $author$project$Voronoi$drawEdge = F2(
	function (edgeTongues, edge) {
		return A2(
			$ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$stroke(
					A2(
						$elm$core$Dict$member,
						$author$project$Voronoi$lineCoord(edge),
						edgeTongues) ? '#bbb' : '#666'),
					$elm$svg$Svg$Attributes$strokeWidth('2.5'),
					$elm$svg$Svg$Events$onClick(
					$author$project$Voronoi$ToggleEdgeTongue(
						$author$project$Voronoi$lineCoord(edge)))
				]),
			edge);
	});
var $elm$svg$Svg$Attributes$d = _VirtualDom_attribute('d');
var $elm$svg$Svg$path = $elm$svg$Svg$trustedNode('path');
var $ianmackenzie$elm_geometry_svg$Geometry$Svg$cubicSpline2d = F2(
	function (attributes, spline) {
		var p4 = $ianmackenzie$elm_geometry$Point2d$unwrap(
			$ianmackenzie$elm_geometry$CubicSpline2d$fourthControlPoint(spline));
		var p3 = $ianmackenzie$elm_geometry$Point2d$unwrap(
			$ianmackenzie$elm_geometry$CubicSpline2d$thirdControlPoint(spline));
		var p2 = $ianmackenzie$elm_geometry$Point2d$unwrap(
			$ianmackenzie$elm_geometry$CubicSpline2d$secondControlPoint(spline));
		var p1 = $ianmackenzie$elm_geometry$Point2d$unwrap(
			$ianmackenzie$elm_geometry$CubicSpline2d$firstControlPoint(spline));
		var pathComponents = _List_fromArray(
			[
				'M',
				$elm$core$String$fromFloat(p1.b5),
				$elm$core$String$fromFloat(p1.b6),
				'C',
				$elm$core$String$fromFloat(p2.b5),
				$elm$core$String$fromFloat(p2.b6),
				$elm$core$String$fromFloat(p3.b5),
				$elm$core$String$fromFloat(p3.b6),
				$elm$core$String$fromFloat(p4.b5),
				$elm$core$String$fromFloat(p4.b6)
			]);
		var pathAttribute = $elm$svg$Svg$Attributes$d(
			A2($elm$core$String$join, ' ', pathComponents));
		return A2(
			$elm$svg$Svg$path,
			A2($elm$core$List$cons, pathAttribute, attributes),
			_List_Nil);
	});
var $author$project$Voronoi$drawWiggly = function (_v0) {
	var w1 = _v0.a;
	var w2 = _v0.b;
	var drawHalf = function (spline) {
		return A2(
			$ianmackenzie$elm_geometry_svg$Geometry$Svg$cubicSpline2d,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$stroke('crimson'),
					$elm$svg$Svg$Attributes$fillOpacity('0'),
					$elm$svg$Svg$Attributes$strokeWidth('2.5')
				]),
			spline);
	};
	return A2(
		$elm$svg$Svg$g,
		_List_Nil,
		_List_fromArray(
			[
				drawHalf(w1),
				drawHalf(w2)
			]));
};
var $ianmackenzie$elm_geometry$Polygon2d$innerLoops = function (_v0) {
	var polygon = _v0;
	return polygon.an;
};
var $ianmackenzie$elm_geometry$Geometry$Types$LineSegment2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$LineSegment2d$fromEndpoints = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$LineSegment2d$from = F2(
	function (startPoint_, endPoint_) {
		return $ianmackenzie$elm_geometry$LineSegment2d$fromEndpoints(
			_Utils_Tuple2(startPoint_, endPoint_));
	});
var $ianmackenzie$elm_geometry$Polygon2d$loopEdges = function (vertices_) {
	if (!vertices_.b) {
		return _List_Nil;
	} else {
		var all = vertices_;
		var first = all.a;
		var rest = all.b;
		return A3(
			$elm$core$List$map2,
			$ianmackenzie$elm_geometry$LineSegment2d$from,
			all,
			_Utils_ap(
				rest,
				_List_fromArray(
					[first])));
	}
};
var $ianmackenzie$elm_geometry$Polygon2d$outerLoop = function (_v0) {
	var polygon = _v0;
	return polygon.aq;
};
var $ianmackenzie$elm_geometry$Polygon2d$edges = function (polygon) {
	var outerEdges = $ianmackenzie$elm_geometry$Polygon2d$loopEdges(
		$ianmackenzie$elm_geometry$Polygon2d$outerLoop(polygon));
	var innerEdges = A2(
		$elm$core$List$map,
		$ianmackenzie$elm_geometry$Polygon2d$loopEdges,
		$ianmackenzie$elm_geometry$Polygon2d$innerLoops(polygon));
	return $elm$core$List$concat(
		A2($elm$core$List$cons, outerEdges, innerEdges));
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$VoronoiDiagram2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Geometry$Types$EmptyDelaunayTriangulation2d = {$: 0};
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$empty = $ianmackenzie$elm_geometry$Geometry$Types$EmptyDelaunayTriangulation2d;
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$empty = {ax: $ianmackenzie$elm_geometry$DelaunayTriangulation2d$empty, bh: _List_Nil};
var $elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var $elm$core$Basics$sqrt = _Basics_sqrt;
var $ianmackenzie$elm_geometry$Vector2d$direction = function (_v0) {
	var v = _v0;
	var largestComponent = A2(
		$elm$core$Basics$max,
		$elm$core$Basics$abs(v.b5),
		$elm$core$Basics$abs(v.b6));
	if (!largestComponent) {
		return $elm$core$Maybe$Nothing;
	} else {
		var scaledY = v.b6 / largestComponent;
		var scaledX = v.b5 / largestComponent;
		var scaledLength = $elm$core$Basics$sqrt((scaledX * scaledX) + (scaledY * scaledY));
		return $elm$core$Maybe$Just(
			{b5: scaledX / scaledLength, b6: scaledY / scaledLength});
	}
};
var $ianmackenzie$elm_geometry$Vector2d$from = F2(
	function (_v0, _v1) {
		var p1 = _v0;
		var p2 = _v1;
		return {b5: p2.b5 - p1.b5, b6: p2.b6 - p1.b6};
	});
var $ianmackenzie$elm_units$Quantity$Quantity = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Quantity$zero = 0;
var $ianmackenzie$elm_geometry$Vector2d$length = function (_v0) {
	var v = _v0;
	var largestComponent = A2(
		$elm$core$Basics$max,
		$elm$core$Basics$abs(v.b5),
		$elm$core$Basics$abs(v.b6));
	if (!largestComponent) {
		return $ianmackenzie$elm_units$Quantity$zero;
	} else {
		var scaledY = v.b6 / largestComponent;
		var scaledX = v.b5 / largestComponent;
		var scaledLength = $elm$core$Basics$sqrt((scaledX * scaledX) + (scaledY * scaledY));
		return scaledLength * largestComponent;
	}
};
var $ianmackenzie$elm_geometry$LineSegment2d$vector = function (lineSegment) {
	var _v0 = $ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
	var p1 = _v0.a;
	var p2 = _v0.b;
	return A2($ianmackenzie$elm_geometry$Vector2d$from, p1, p2);
};
var $ianmackenzie$elm_geometry$LineSegment2d$length = function (givenSegment) {
	return $ianmackenzie$elm_geometry$Vector2d$length(
		$ianmackenzie$elm_geometry$LineSegment2d$vector(givenSegment));
};
var $elm$core$Basics$cos = _Basics_cos;
var $elm$core$Basics$sin = _Basics_sin;
var $ianmackenzie$elm_geometry$Direction2d$fromAngle = function (_v0) {
	var angle = _v0;
	return {
		b5: $elm$core$Basics$cos(angle),
		b6: $elm$core$Basics$sin(angle)
	};
};
var $ianmackenzie$elm_units$Angle$radians = function (numRadians) {
	return numRadians;
};
var $ianmackenzie$elm_geometry$Direction2d$radians = function (numRadians) {
	return $ianmackenzie$elm_geometry$Direction2d$fromAngle(
		$ianmackenzie$elm_units$Angle$radians(numRadians));
};
var $ianmackenzie$elm_geometry$Point2d$rotateAround = F3(
	function (_v0, _v1, _v2) {
		var p0 = _v0;
		var theta = _v1;
		var p = _v2;
		var s = $elm$core$Basics$sin(theta);
		var deltaY = p.b6 - p0.b6;
		var deltaX = p.b5 - p0.b5;
		var c = $elm$core$Basics$cos(theta);
		return {b5: (p0.b5 + (c * deltaX)) - (s * deltaY), b6: (p0.b6 + (s * deltaX)) + (c * deltaY)};
	});
var $ianmackenzie$elm_geometry$CubicSpline2d$rotateAround = F3(
	function (point, angle, spline) {
		return A2(
			$ianmackenzie$elm_geometry$CubicSpline2d$mapControlPoints,
			A2($ianmackenzie$elm_geometry$Point2d$rotateAround, point, angle),
			spline);
	});
var $ianmackenzie$elm_geometry$Point2d$scaleAbout = F3(
	function (_v0, k, _v1) {
		var p0 = _v0;
		var p = _v1;
		return {b5: p0.b5 + (k * (p.b5 - p0.b5)), b6: p0.b6 + (k * (p.b6 - p0.b6))};
	});
var $ianmackenzie$elm_geometry$CubicSpline2d$scaleAbout = F3(
	function (point, scale, spline) {
		return A2(
			$ianmackenzie$elm_geometry$CubicSpline2d$mapControlPoints,
			A2($ianmackenzie$elm_geometry$Point2d$scaleAbout, point, scale),
			spline);
	});
var $ianmackenzie$elm_geometry$CubicSpline2d$startPoint = function (_v0) {
	var spline = _v0;
	return spline.al;
};
var $ianmackenzie$elm_geometry$LineSegment2d$startPoint = function (_v0) {
	var _v1 = _v0;
	var start = _v1.a;
	return start;
};
var $elm$core$Basics$atan2 = _Basics_atan2;
var $ianmackenzie$elm_geometry$Direction2d$toAngle = function (_v0) {
	var d = _v0;
	return A2($elm$core$Basics$atan2, d.b6, d.b5);
};
var $ianmackenzie$elm_units$Quantity$toFloat = function (_v0) {
	var value = _v0;
	return value;
};
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Voronoi$fitWiggly = F2(
	function (_v0, segment) {
		var w1 = _v0.a;
		var w2 = _v0.b;
		var segmentLen = $ianmackenzie$elm_units$Quantity$toFloat(
			$ianmackenzie$elm_geometry$LineSegment2d$length(segment));
		var rotationAngle = $ianmackenzie$elm_geometry$Direction2d$toAngle(
			A2(
				$elm$core$Maybe$withDefault,
				$ianmackenzie$elm_geometry$Direction2d$radians(0),
				$ianmackenzie$elm_geometry$Vector2d$direction(
					$ianmackenzie$elm_geometry$LineSegment2d$vector(segment))));
		var pivot = $ianmackenzie$elm_geometry$CubicSpline2d$startPoint(w1);
		var scale = function (spline) {
			return A3($ianmackenzie$elm_geometry$CubicSpline2d$scaleAbout, pivot, (1 / 200) * segmentLen, spline);
		};
		var translationVector = A2(
			$ianmackenzie$elm_geometry$Vector2d$from,
			pivot,
			$ianmackenzie$elm_geometry$LineSegment2d$startPoint(segment));
		var fit = function (w) {
			return A3(
				$ianmackenzie$elm_geometry$CubicSpline2d$rotateAround,
				$ianmackenzie$elm_geometry$LineSegment2d$startPoint(segment),
				rotationAngle,
				A2(
					$ianmackenzie$elm_geometry$CubicSpline2d$translateBy,
					translationVector,
					scale(w)));
		};
		return _Utils_Tuple2(
			fit(w1),
			fit(w2));
	});
var $ianmackenzie$elm_geometry$Geometry$Types$BoundingBox2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Quantity$max = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return A2($elm$core$Basics$max, x, y);
	});
var $elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var $ianmackenzie$elm_units$Quantity$min = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return A2($elm$core$Basics$min, x, y);
	});
var $ianmackenzie$elm_geometry$Point2d$xCoordinate = function (_v0) {
	var p = _v0;
	return p.b5;
};
var $ianmackenzie$elm_geometry$Point2d$yCoordinate = function (_v0) {
	var p = _v0;
	return p.b6;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$from = F2(
	function (firstPoint, secondPoint) {
		var y2 = $ianmackenzie$elm_geometry$Point2d$yCoordinate(secondPoint);
		var y1 = $ianmackenzie$elm_geometry$Point2d$yCoordinate(firstPoint);
		var x2 = $ianmackenzie$elm_geometry$Point2d$xCoordinate(secondPoint);
		var x1 = $ianmackenzie$elm_geometry$Point2d$xCoordinate(firstPoint);
		return {
			cl: A2($ianmackenzie$elm_units$Quantity$max, x1, x2),
			cm: A2($ianmackenzie$elm_units$Quantity$max, y1, y2),
			cn: A2($ianmackenzie$elm_units$Quantity$min, x1, x2),
			co: A2($ianmackenzie$elm_units$Quantity$min, y1, y2)
		};
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$CoincidentVertices = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$Polygonal = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$UShaped = F4(
	function (a, b, c, d) {
		return {$: 1, a: a, b: b, c: c, d: d};
	});
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Polyline2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Polyline2d$fromVertices = function (givenVertices) {
	return givenVertices;
};
var $ianmackenzie$elm_units$Quantity$abs = function (_v0) {
	var value = _v0;
	return $elm$core$Basics$abs(value);
};
var $ianmackenzie$elm_units$Quantity$lessThan = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) < 0;
	});
var $ianmackenzie$elm_units$Quantity$minus = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return x - y;
	});
var $ianmackenzie$elm_units$Quantity$plus = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return x + y;
	});
var $ianmackenzie$elm_units$Quantity$ratio = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return x / y;
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$pseudoAngle = F2(
	function (startPoint, endPoint) {
		var y1 = $ianmackenzie$elm_geometry$Point2d$yCoordinate(endPoint);
		var y0 = $ianmackenzie$elm_geometry$Point2d$yCoordinate(startPoint);
		var x1 = $ianmackenzie$elm_geometry$Point2d$xCoordinate(endPoint);
		var x0 = $ianmackenzie$elm_geometry$Point2d$xCoordinate(startPoint);
		var dy = A2($ianmackenzie$elm_units$Quantity$minus, y0, y1);
		var dx = A2($ianmackenzie$elm_units$Quantity$minus, x0, x1);
		var absoluteSum = A2(
			$ianmackenzie$elm_units$Quantity$plus,
			$ianmackenzie$elm_units$Quantity$abs(dy),
			$ianmackenzie$elm_units$Quantity$abs(dx));
		var p = A2($ianmackenzie$elm_units$Quantity$ratio, dx, absoluteSum);
		return A2($ianmackenzie$elm_units$Quantity$lessThan, $ianmackenzie$elm_units$Quantity$zero, dy) ? (p - 1) : (1 - p);
	});
var $ianmackenzie$elm_geometry$Direction2d$rotateClockwise = function (_v0) {
	var d = _v0;
	return {b5: d.b6, b6: -d.b5};
};
var $ianmackenzie$elm_geometry$Point2d$signedDistanceAlong = F2(
	function (_v0, _v1) {
		var axis = _v0;
		var p = _v1;
		var _v2 = axis.D;
		var p0 = _v2;
		var _v3 = axis.B;
		var d = _v3;
		return ((p.b5 - p0.b5) * d.b5) + ((p.b6 - p0.b6) * d.b6);
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Polygon2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Vector2d$cross = F2(
	function (_v0, _v1) {
		var v2 = _v0;
		var v1 = _v1;
		return (v1.b5 * v2.b6) - (v1.b6 * v2.b5);
	});
var $ianmackenzie$elm_units$Quantity$multiplyBy = F2(
	function (scale, _v0) {
		var value = _v0;
		return scale * value;
	});
var $ianmackenzie$elm_geometry$Triangle2d$vertices = function (_v0) {
	var triangleVertices = _v0;
	return triangleVertices;
};
var $ianmackenzie$elm_geometry$Triangle2d$counterclockwiseArea = function (triangle) {
	var _v0 = $ianmackenzie$elm_geometry$Triangle2d$vertices(triangle);
	var p1 = _v0.a;
	var p2 = _v0.b;
	var p3 = _v0.c;
	var firstVector = A2($ianmackenzie$elm_geometry$Vector2d$from, p1, p2);
	var secondVector = A2($ianmackenzie$elm_geometry$Vector2d$from, p1, p3);
	return A2(
		$ianmackenzie$elm_units$Quantity$multiplyBy,
		0.5,
		A2($ianmackenzie$elm_geometry$Vector2d$cross, secondVector, firstVector));
};
var $ianmackenzie$elm_geometry$Geometry$Types$Triangle2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Triangle2d$from = F3(
	function (p1, p2, p3) {
		return _Utils_Tuple3(p1, p2, p3);
	});
var $ianmackenzie$elm_units$Quantity$sum = function (quantities) {
	return A3($elm$core$List$foldl, $ianmackenzie$elm_units$Quantity$plus, $ianmackenzie$elm_units$Quantity$zero, quantities);
};
var $ianmackenzie$elm_geometry$Polygon2d$counterclockwiseArea = function (vertices_) {
	if (!vertices_.b) {
		return $ianmackenzie$elm_units$Quantity$zero;
	} else {
		if (!vertices_.b.b) {
			var single = vertices_.a;
			return $ianmackenzie$elm_units$Quantity$zero;
		} else {
			if (!vertices_.b.b.b) {
				var first = vertices_.a;
				var _v1 = vertices_.b;
				var second = _v1.a;
				return $ianmackenzie$elm_units$Quantity$zero;
			} else {
				var first = vertices_.a;
				var _v2 = vertices_.b;
				var second = _v2.a;
				var rest = _v2.b;
				var segmentArea = F2(
					function (start, end) {
						return $ianmackenzie$elm_geometry$Triangle2d$counterclockwiseArea(
							A3($ianmackenzie$elm_geometry$Triangle2d$from, first, start, end));
					});
				var segmentAreas = A3(
					$elm$core$List$map2,
					segmentArea,
					A2($elm$core$List$cons, second, rest),
					rest);
				return $ianmackenzie$elm_units$Quantity$sum(segmentAreas);
			}
		}
	}
};
var $ianmackenzie$elm_units$Quantity$lessThanOrEqualTo = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) < 1;
	});
var $ianmackenzie$elm_geometry$Polygon2d$makeInnerLoop = function (vertices_) {
	return A2(
		$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
		$ianmackenzie$elm_units$Quantity$zero,
		$ianmackenzie$elm_geometry$Polygon2d$counterclockwiseArea(vertices_)) ? vertices_ : $elm$core$List$reverse(vertices_);
};
var $ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) > -1;
	});
var $ianmackenzie$elm_geometry$Polygon2d$makeOuterLoop = function (vertices_) {
	return A2(
		$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
		$ianmackenzie$elm_units$Quantity$zero,
		$ianmackenzie$elm_geometry$Polygon2d$counterclockwiseArea(vertices_)) ? vertices_ : $elm$core$List$reverse(vertices_);
};
var $ianmackenzie$elm_geometry$Polygon2d$withHoles = F2(
	function (givenInnerLoops, givenOuterLoop) {
		return {
			an: A2($elm$core$List$map, $ianmackenzie$elm_geometry$Polygon2d$makeInnerLoop, givenInnerLoops),
			aq: $ianmackenzie$elm_geometry$Polygon2d$makeOuterLoop(givenOuterLoop)
		};
	});
var $ianmackenzie$elm_geometry$Polygon2d$singleLoop = function (givenOuterLoop) {
	return A2($ianmackenzie$elm_geometry$Polygon2d$withHoles, _List_Nil, givenOuterLoop);
};
var $elm$core$List$sortBy = _List_sortBy;
var $ianmackenzie$elm_units$Quantity$compare = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return A2($elm$core$Basics$compare, x, y);
	});
var $elm$core$List$sortWith = _List_sortWith;
var $ianmackenzie$elm_units$Quantity$sortBy = F2(
	function (toQuantity, list) {
		var comparator = F2(
			function (first, second) {
				return A2(
					$ianmackenzie$elm_units$Quantity$compare,
					toQuantity(first),
					toQuantity(second));
			});
		return A2($elm$core$List$sortWith, comparator, list);
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$collectRegions = F3(
	function (accumulatorsByIndex, delaunayVertex, accumulatedRegions) {
		var _v0 = A2($elm$core$Dict$get, delaunayVertex.u, accumulatorsByIndex);
		if (!_v0.$) {
			var points = _v0.a.ae;
			var startDirection = _v0.a.as;
			var endDirection = _v0.a.ak;
			var _v1 = _Utils_Tuple2(startDirection, endDirection);
			_v1$2:
			while (true) {
				if (_v1.a.$ === 1) {
					if (_v1.b.$ === 1) {
						var _v2 = _v1.a;
						var _v3 = _v1.b;
						var sortedPoints = A2(
							$elm$core$List$sortBy,
							$ianmackenzie$elm_geometry$VoronoiDiagram2d$pseudoAngle(delaunayVertex.h),
							points);
						var polygon = $ianmackenzie$elm_geometry$Polygon2d$singleLoop(sortedPoints);
						var polygonalRegion = A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$Polygonal, delaunayVertex.N, polygon);
						return A2($elm$core$List$cons, polygonalRegion, accumulatedRegions);
					} else {
						break _v1$2;
					}
				} else {
					if (!_v1.b.$) {
						var startDirection_ = _v1.a.a;
						var endDirection_ = _v1.b.a;
						var sortDirection = $ianmackenzie$elm_geometry$Direction2d$rotateClockwise(startDirection_);
						var sortAxis = A2($ianmackenzie$elm_geometry$Axis2d$through, delaunayVertex.h, sortDirection);
						var sortedPoints = A2(
							$ianmackenzie$elm_units$Quantity$sortBy,
							$ianmackenzie$elm_geometry$Point2d$signedDistanceAlong(sortAxis),
							points);
						if (sortedPoints.b) {
							var startPoint = sortedPoints.a;
							var remainingPoints = sortedPoints.b;
							var polyline = $ianmackenzie$elm_geometry$Polyline2d$fromVertices(sortedPoints);
							var leftAxis = A2($ianmackenzie$elm_geometry$Axis2d$through, startPoint, startDirection_);
							var endPoint = A3($elm$core$List$foldl, $elm$core$Basics$always, startPoint, remainingPoints);
							var rightAxis = A2($ianmackenzie$elm_geometry$Axis2d$through, endPoint, endDirection_);
							var uShapedRegion = A4($ianmackenzie$elm_geometry$VoronoiDiagram2d$UShaped, delaunayVertex.N, leftAxis, rightAxis, polyline);
							return A2($elm$core$List$cons, uShapedRegion, accumulatedRegions);
						} else {
							return accumulatedRegions;
						}
					} else {
						break _v1$2;
					}
				}
			}
			return accumulatedRegions;
		} else {
			return accumulatedRegions;
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$Unbounded = function (a) {
	return {$: 4, a: a};
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$HalfPlane = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$Strip = F3(
	function (a, b, c) {
		return {$: 2, a: a, b: b, c: c};
	});
var $ianmackenzie$elm_geometry$Point2d$midpoint = F2(
	function (_v0, _v1) {
		var p1 = _v0;
		var p2 = _v1;
		return {b5: p1.b5 + (0.5 * (p2.b5 - p1.b5)), b6: p1.b6 + (0.5 * (p2.b6 - p1.b6))};
	});
var $ianmackenzie$elm_geometry$Direction2d$reverse = function (_v0) {
	var d = _v0;
	return {b5: -d.b5, b6: -d.b6};
};
var $ianmackenzie$elm_geometry$Axis2d$reverse = function (_v0) {
	var axis = _v0;
	return A2(
		$ianmackenzie$elm_geometry$Axis2d$through,
		axis.D,
		$ianmackenzie$elm_geometry$Direction2d$reverse(axis.B));
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$collectStrips = F6(
	function (direction, axisDirection, maybeLastAxis, current, following, accumulated) {
		collectStrips:
		while (true) {
			if (!following.b) {
				if (!maybeLastAxis.$) {
					var lastAxis = maybeLastAxis.a;
					return A2(
						$elm$core$List$cons,
						A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$HalfPlane, current.N, lastAxis),
						accumulated);
				} else {
					return _List_fromArray(
						[
							$ianmackenzie$elm_geometry$VoronoiDiagram2d$Unbounded(current.N)
						]);
				}
			} else {
				var next = following.a;
				var after = following.b;
				var midpoint = A2($ianmackenzie$elm_geometry$Point2d$midpoint, current.h, next.h);
				var newAxis = A2($ianmackenzie$elm_geometry$Axis2d$through, midpoint, axisDirection);
				var newRegion = function () {
					if (!maybeLastAxis.$) {
						var lastAxis = maybeLastAxis.a;
						return A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$Strip, current.N, lastAxis, newAxis);
					} else {
						return A2(
							$ianmackenzie$elm_geometry$VoronoiDiagram2d$HalfPlane,
							current.N,
							$ianmackenzie$elm_geometry$Axis2d$reverse(newAxis));
					}
				}();
				var $temp$direction = direction,
					$temp$axisDirection = axisDirection,
					$temp$maybeLastAxis = $elm$core$Maybe$Just(newAxis),
					$temp$current = next,
					$temp$following = after,
					$temp$accumulated = A2($elm$core$List$cons, newRegion, accumulated);
				direction = $temp$direction;
				axisDirection = $temp$axisDirection;
				maybeLastAxis = $temp$maybeLastAxis;
				current = $temp$current;
				following = $temp$following;
				accumulated = $temp$accumulated;
				continue collectStrips;
			}
		}
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$maxX = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.cl;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$maxY = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.cm;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$minX = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.cn;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$minY = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.co;
};
var $ianmackenzie$elm_geometry$BoundingBox2d$dimensions = function (boundingBox) {
	return _Utils_Tuple2(
		A2(
			$ianmackenzie$elm_units$Quantity$minus,
			$ianmackenzie$elm_geometry$BoundingBox2d$minX(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox2d$maxX(boundingBox)),
		A2(
			$ianmackenzie$elm_units$Quantity$minus,
			$ianmackenzie$elm_geometry$BoundingBox2d$minY(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox2d$maxY(boundingBox)));
};
var $ianmackenzie$elm_geometry$Direction2d$from = F2(
	function (firstPoint, secondPoint) {
		return $ianmackenzie$elm_geometry$Vector2d$direction(
			A2($ianmackenzie$elm_geometry$Vector2d$from, firstPoint, secondPoint));
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$hullOfHelp = F6(
	function (currentMinX, currentMaxX, currentMinY, currentMaxY, getPoint, list) {
		hullOfHelp:
		while (true) {
			if (list.b) {
				var next = list.a;
				var rest = list.b;
				var _v1 = getPoint(next);
				var x = _v1.b5;
				var y = _v1.b6;
				var $temp$currentMinX = A2($elm$core$Basics$min, x, currentMinX),
					$temp$currentMaxX = A2($elm$core$Basics$max, x, currentMaxX),
					$temp$currentMinY = A2($elm$core$Basics$min, y, currentMinY),
					$temp$currentMaxY = A2($elm$core$Basics$max, y, currentMaxY),
					$temp$getPoint = getPoint,
					$temp$list = rest;
				currentMinX = $temp$currentMinX;
				currentMaxX = $temp$currentMaxX;
				currentMinY = $temp$currentMinY;
				currentMaxY = $temp$currentMaxY;
				getPoint = $temp$getPoint;
				list = $temp$list;
				continue hullOfHelp;
			} else {
				return {cl: currentMaxX, cm: currentMaxY, cn: currentMinX, co: currentMinY};
			}
		}
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$hullOf = F3(
	function (getPoint, first, rest) {
		var _v0 = getPoint(first);
		var x = _v0.b5;
		var y = _v0.b6;
		return A6($ianmackenzie$elm_geometry$BoundingBox2d$hullOfHelp, x, x, y, y, getPoint, rest);
	});
var $ianmackenzie$elm_geometry$Direction2d$rotateCounterclockwise = function (_v0) {
	var d = _v0;
	return {b5: -d.b6, b6: d.b5};
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$collinearVertexRegions = function (delaunayVertices) {
	if (delaunayVertices.b) {
		var first = delaunayVertices.a;
		var rest = delaunayVertices.b;
		var boundingBox = A3(
			$ianmackenzie$elm_geometry$BoundingBox2d$hullOf,
			function ($) {
				return $.h;
			},
			first,
			rest);
		var _v1 = $ianmackenzie$elm_geometry$BoundingBox2d$dimensions(boundingBox);
		var width = _v1.a;
		var height = _v1.b;
		var sortCoordinate = A2($ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo, height, width) ? function (vertex) {
			return $ianmackenzie$elm_geometry$Point2d$xCoordinate(vertex.h);
		} : function (vertex) {
			return $ianmackenzie$elm_geometry$Point2d$yCoordinate(vertex.h);
		};
		var sortedVertices = A2($ianmackenzie$elm_units$Quantity$sortBy, sortCoordinate, delaunayVertices);
		if (sortedVertices.b) {
			if (!sortedVertices.b.b) {
				var singleVertex = sortedVertices.a;
				return _List_fromArray(
					[
						$ianmackenzie$elm_geometry$VoronoiDiagram2d$Unbounded(singleVertex.N)
					]);
			} else {
				var firstVertex = sortedVertices.a;
				var remainingVertices = sortedVertices.b;
				var lastVertex = A3($elm$core$List$foldl, $elm$core$Basics$always, firstVertex, remainingVertices);
				var _v3 = A2($ianmackenzie$elm_geometry$Direction2d$from, firstVertex.h, lastVertex.h);
				if (!_v3.$) {
					var direction = _v3.a;
					var axisDirection = $ianmackenzie$elm_geometry$Direction2d$rotateCounterclockwise(direction);
					return A6($ianmackenzie$elm_geometry$VoronoiDiagram2d$collectStrips, direction, axisDirection, $elm$core$Maybe$Nothing, firstVertex, remainingVertices, _List_Nil);
				} else {
					return _List_Nil;
				}
			}
		} else {
			return _List_Nil;
		}
	} else {
		return _List_Nil;
	}
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$hasFiniteFace = function (faces) {
	hasFiniteFace:
	while (true) {
		if (!faces.b) {
			return false;
		} else {
			var first = faces.a;
			var rest = faces.b;
			switch (first.$) {
				case 0:
					return true;
				case 1:
					var $temp$faces = rest;
					faces = $temp$faces;
					continue hasFiniteFace;
				default:
					var $temp$faces = rest;
					faces = $temp$faces;
					continue hasFiniteFace;
			}
		}
	}
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addEndDirection = F2(
	function (direction, entry) {
		if (!entry.$) {
			var accumulator = entry.a;
			return $elm$core$Maybe$Just(
				_Utils_update(
					accumulator,
					{
						ak: $elm$core$Maybe$Just(direction)
					}));
		} else {
			return $elm$core$Maybe$Just(
				{
					ak: $elm$core$Maybe$Just(direction),
					ae: _List_Nil,
					as: $elm$core$Maybe$Nothing
				});
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addInterior = F2(
	function (point, entry) {
		if (!entry.$) {
			var accumulator = entry.a;
			return $elm$core$Maybe$Just(
				_Utils_update(
					accumulator,
					{
						ae: A2($elm$core$List$cons, point, accumulator.ae)
					}));
		} else {
			return $elm$core$Maybe$Just(
				{
					ak: $elm$core$Maybe$Nothing,
					ae: _List_fromArray(
						[point]),
					as: $elm$core$Maybe$Nothing
				});
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addStartDirection = F2(
	function (direction, entry) {
		if (!entry.$) {
			var accumulator = entry.a;
			return $elm$core$Maybe$Just(
				_Utils_update(
					accumulator,
					{
						as: $elm$core$Maybe$Just(direction)
					}));
		} else {
			return $elm$core$Maybe$Just(
				{
					ak: $elm$core$Maybe$Nothing,
					ae: _List_Nil,
					as: $elm$core$Maybe$Just(direction)
				});
		}
	});
var $ianmackenzie$elm_geometry$Circle2d$centerPoint = function (_v0) {
	var properties = _v0;
	return properties.br;
};
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$updateAccumulators = F2(
	function (face, accumulators) {
		switch (face.$) {
			case 0:
				var firstVertex = face.a;
				var secondVertex = face.b;
				var thirdVertex = face.c;
				var circumcircle = face.d;
				var centerPoint = $ianmackenzie$elm_geometry$Circle2d$centerPoint(circumcircle);
				return A3(
					$elm$core$Dict$update,
					thirdVertex.u,
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addInterior(centerPoint),
					A3(
						$elm$core$Dict$update,
						secondVertex.u,
						$ianmackenzie$elm_geometry$VoronoiDiagram2d$addInterior(centerPoint),
						A3(
							$elm$core$Dict$update,
							firstVertex.u,
							$ianmackenzie$elm_geometry$VoronoiDiagram2d$addInterior(centerPoint),
							accumulators)));
			case 1:
				var firstVertex = face.a;
				var secondVertex = face.b;
				var edgeDirection = face.d;
				var direction = $ianmackenzie$elm_geometry$Direction2d$rotateCounterclockwise(edgeDirection);
				return A3(
					$elm$core$Dict$update,
					secondVertex.u,
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addStartDirection(direction),
					A3(
						$elm$core$Dict$update,
						firstVertex.u,
						$ianmackenzie$elm_geometry$VoronoiDiagram2d$addEndDirection(direction),
						accumulators));
			default:
				return accumulators;
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$voronoiRegions = function (delaunayTriangulation) {
	if (!delaunayTriangulation.$) {
		return _List_Nil;
	} else {
		var triangulation = delaunayTriangulation.a;
		if ($ianmackenzie$elm_geometry$VoronoiDiagram2d$hasFiniteFace(triangulation.aA)) {
			var accumulatorsByIndex = A3($elm$core$List$foldl, $ianmackenzie$elm_geometry$VoronoiDiagram2d$updateAccumulators, $elm$core$Dict$empty, triangulation.aA);
			return A3(
				$elm$core$List$foldl,
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$collectRegions(accumulatorsByIndex),
				_List_Nil,
				triangulation.ay);
		} else {
			return $ianmackenzie$elm_geometry$VoronoiDiagram2d$collinearVertexRegions(triangulation.ay);
		}
	}
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$fromDelaunayTriangulation = function (triangulation) {
	return {
		ax: triangulation,
		bh: $ianmackenzie$elm_geometry$VoronoiDiagram2d$voronoiRegions(triangulation)
	};
};
var $ianmackenzie$elm_geometry$Geometry$Types$DelaunayTriangulation2d = function (a) {
	return {$: 1, a: a};
};
var $ianmackenzie$elm_geometry$Geometry$Types$OneVertexFace = F4(
	function (a, b, c, d) {
		return {$: 2, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_geometry$Geometry$Types$ThreeVertexFace = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_geometry$Geometry$Types$TwoVertexFace = F4(
	function (a, b, c, d) {
		return {$: 1, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_geometry$Point2d$circumenterHelp = F6(
	function (_v0, _v1, _v2, a, b, c) {
		var p1 = _v0;
		var p2 = _v1;
		var p3 = _v2;
		var bc = b * c;
		if (!bc) {
			return $elm$core$Maybe$Nothing;
		} else {
			var cy = p1.b6 - p3.b6;
			var cx = p1.b5 - p3.b5;
			var by = p3.b6 - p2.b6;
			var bx = p3.b5 - p2.b5;
			var sinA = ((bx * cy) - (by * cx)) / bc;
			if (!sinA) {
				return $elm$core$Maybe$Nothing;
			} else {
				var cosA = ((bx * cx) + (by * cy)) / bc;
				var scale = cosA / (2 * sinA);
				var ay = p2.b6 - p1.b6;
				var ax = p2.b5 - p1.b5;
				return $elm$core$Maybe$Just(
					{b5: (p1.b5 + (0.5 * ax)) + (scale * ay), b6: (p1.b6 + (0.5 * ay)) - (scale * ax)});
			}
		}
	});
var $ianmackenzie$elm_geometry$Point2d$distanceFrom = F2(
	function (_v0, _v1) {
		var p1 = _v0;
		var p2 = _v1;
		var deltaY = p2.b6 - p1.b6;
		var deltaX = p2.b5 - p1.b5;
		var largestComponent = A2(
			$elm$core$Basics$max,
			$elm$core$Basics$abs(deltaX),
			$elm$core$Basics$abs(deltaY));
		if (!largestComponent) {
			return $ianmackenzie$elm_units$Quantity$zero;
		} else {
			var scaledY = deltaY / largestComponent;
			var scaledX = deltaX / largestComponent;
			var scaledLength = $elm$core$Basics$sqrt((scaledX * scaledX) + (scaledY * scaledY));
			return scaledLength * largestComponent;
		}
	});
var $ianmackenzie$elm_geometry$Point2d$circumcenter = F3(
	function (p1, p2, p3) {
		var _v0 = A2($ianmackenzie$elm_geometry$Point2d$distanceFrom, p3, p1);
		var c = _v0;
		var _v1 = A2($ianmackenzie$elm_geometry$Point2d$distanceFrom, p2, p3);
		var b = _v1;
		var _v2 = A2($ianmackenzie$elm_geometry$Point2d$distanceFrom, p1, p2);
		var a = _v2;
		return (_Utils_cmp(a, b) > -1) ? ((_Utils_cmp(a, c) > -1) ? A6($ianmackenzie$elm_geometry$Point2d$circumenterHelp, p1, p2, p3, a, b, c) : A6($ianmackenzie$elm_geometry$Point2d$circumenterHelp, p3, p1, p2, c, a, b)) : ((_Utils_cmp(b, c) > -1) ? A6($ianmackenzie$elm_geometry$Point2d$circumenterHelp, p2, p3, p1, b, c, a) : A6($ianmackenzie$elm_geometry$Point2d$circumenterHelp, p3, p1, p2, c, a, b));
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Circle2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Circle2d$withRadius = F2(
	function (givenRadius, givenCenterPoint) {
		return {
			br: givenCenterPoint,
			bV: $ianmackenzie$elm_units$Quantity$abs(givenRadius)
		};
	});
var $ianmackenzie$elm_geometry$Circle2d$throughPoints = F3(
	function (p1, p2, p3) {
		return A2(
			$elm$core$Maybe$map,
			function (p0) {
				var r3 = A2($ianmackenzie$elm_geometry$Point2d$distanceFrom, p0, p3);
				var r2 = A2($ianmackenzie$elm_geometry$Point2d$distanceFrom, p0, p2);
				var r1 = A2($ianmackenzie$elm_geometry$Point2d$distanceFrom, p0, p1);
				var r = A2(
					$ianmackenzie$elm_units$Quantity$multiplyBy,
					1 / 3,
					A2(
						$ianmackenzie$elm_units$Quantity$plus,
						r3,
						A2($ianmackenzie$elm_units$Quantity$plus, r2, r1)));
				return A2($ianmackenzie$elm_geometry$Circle2d$withRadius, r, p0);
			},
			A3($ianmackenzie$elm_geometry$Point2d$circumcenter, p1, p2, p3));
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$addNewFace = F4(
	function (newVertex, ignoredEdgeKey, edge, currentFaces) {
		switch (edge.$) {
			case 0:
				var firstDelaunayVertex = edge.a;
				var secondDelaunayVertex = edge.b;
				var maybeCircumcircle = A3($ianmackenzie$elm_geometry$Circle2d$throughPoints, newVertex.h, firstDelaunayVertex.h, secondDelaunayVertex.h);
				if (!maybeCircumcircle.$) {
					var circumcircle = maybeCircumcircle.a;
					var newFace = A4($ianmackenzie$elm_geometry$Geometry$Types$ThreeVertexFace, newVertex, firstDelaunayVertex, secondDelaunayVertex, circumcircle);
					return A2($elm$core$List$cons, newFace, currentFaces);
				} else {
					return currentFaces;
				}
			case 1:
				var vertex = edge.a;
				var outerIndex = edge.b;
				var _v2 = A2($ianmackenzie$elm_geometry$Direction2d$from, newVertex.h, vertex.h);
				if (!_v2.$) {
					var edgeDirection = _v2.a;
					var newFace = A4($ianmackenzie$elm_geometry$Geometry$Types$TwoVertexFace, newVertex, vertex, outerIndex, edgeDirection);
					return A2($elm$core$List$cons, newFace, currentFaces);
				} else {
					return currentFaces;
				}
			case 2:
				var outerIndex = edge.a;
				var vertex = edge.b;
				var _v3 = A2($ianmackenzie$elm_geometry$Direction2d$from, vertex.h, newVertex.h);
				if (!_v3.$) {
					var edgeDirection = _v3.a;
					var newFace = A4($ianmackenzie$elm_geometry$Geometry$Types$TwoVertexFace, vertex, newVertex, outerIndex, edgeDirection);
					return A2($elm$core$List$cons, newFace, currentFaces);
				} else {
					return currentFaces;
				}
			default:
				var edgeDirection = edge.a;
				var firstOuterIndex = edge.b;
				var secondOuterIndex = edge.c;
				var newFace = A4($ianmackenzie$elm_geometry$Geometry$Types$OneVertexFace, newVertex, firstOuterIndex, secondOuterIndex, edgeDirection);
				return A2($elm$core$List$cons, newFace, currentFaces);
		}
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$InnerEdge = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$InnerToOuterEdge = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$OuterEdge = F3(
	function (a, b, c) {
		return {$: 3, a: a, b: b, c: c};
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$OuterToInnerEdge = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge = F2(
	function (newEdge, maybeEdge) {
		if (!maybeEdge.$) {
			var edge = maybeEdge.a;
			return $elm$core$Maybe$Nothing;
		} else {
			return $elm$core$Maybe$Just(newEdge);
		}
	});
var $ianmackenzie$elm_geometry$Circle2d$radius = function (_v0) {
	var properties = _v0;
	return properties.bV;
};
var $ianmackenzie$elm_geometry$Circle2d$contains = F2(
	function (point, circle) {
		return A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$Circle2d$radius(circle),
			A2(
				$ianmackenzie$elm_geometry$Point2d$distanceFrom,
				$ianmackenzie$elm_geometry$Circle2d$centerPoint(circle),
				point));
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey = F2(
	function (i, j) {
		var y = j + 3;
		var x = i + 3;
		return (_Utils_cmp(x, y) > -1) ? ((x * x) + y) : ((y * y) + x);
	});
var $ianmackenzie$elm_units$Quantity$greaterThan = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) > 0;
	});
var $ianmackenzie$elm_geometry$Quantity$Extra$aXbY = F4(
	function (a, _v0, b, _v1) {
		var x = _v0;
		var y = _v1;
		return (a * x) + (b * y);
	});
var $ianmackenzie$elm_geometry$Direction2d$xComponent = function (_v0) {
	var d = _v0;
	return d.b5;
};
var $ianmackenzie$elm_geometry$Direction2d$yComponent = function (_v0) {
	var d = _v0;
	return d.b6;
};
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$signedDistance = F3(
	function (point, vertexPosition, edgeDirection) {
		var y0 = $ianmackenzie$elm_geometry$Point2d$yCoordinate(vertexPosition);
		var y = $ianmackenzie$elm_geometry$Point2d$yCoordinate(point);
		var x0 = $ianmackenzie$elm_geometry$Point2d$xCoordinate(vertexPosition);
		var x = $ianmackenzie$elm_geometry$Point2d$xCoordinate(point);
		var dy = $ianmackenzie$elm_geometry$Direction2d$yComponent(edgeDirection);
		var dx = $ianmackenzie$elm_geometry$Direction2d$xComponent(edgeDirection);
		return A4(
			$ianmackenzie$elm_geometry$Quantity$Extra$aXbY,
			dx,
			A2($ianmackenzie$elm_units$Quantity$minus, y0, y),
			-dy,
			A2($ianmackenzie$elm_units$Quantity$minus, x0, x));
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$processFaces = F4(
	function (facesToProcess, newVertex, retainedFaces, edgesByKey) {
		processFaces:
		while (true) {
			if (facesToProcess.b) {
				var firstFace = facesToProcess.a;
				var remainingFaces = facesToProcess.b;
				switch (firstFace.$) {
					case 0:
						var firstVertex = firstFace.a;
						var secondVertex = firstFace.b;
						var thirdVertex = firstFace.c;
						var circumcircle = firstFace.d;
						if (A2($ianmackenzie$elm_geometry$Circle2d$contains, newVertex.h, circumcircle)) {
							var thirdIndex = thirdVertex.u;
							var secondIndex = secondVertex.u;
							var key2 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, secondIndex, thirdIndex);
							var firstIndex = firstVertex.u;
							var key1 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, firstIndex, secondIndex);
							var key3 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, thirdIndex, firstIndex);
							var edge3 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$InnerEdge, thirdVertex, firstVertex);
							var edge2 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$InnerEdge, secondVertex, thirdVertex);
							var edge1 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$InnerEdge, firstVertex, secondVertex);
							var updatedEdges = A3(
								$elm$core$Dict$update,
								key3,
								$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge3),
								A3(
									$elm$core$Dict$update,
									key2,
									$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge2),
									A3(
										$elm$core$Dict$update,
										key1,
										$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge1),
										edgesByKey)));
							var $temp$facesToProcess = remainingFaces,
								$temp$newVertex = newVertex,
								$temp$retainedFaces = retainedFaces,
								$temp$edgesByKey = updatedEdges;
							facesToProcess = $temp$facesToProcess;
							newVertex = $temp$newVertex;
							retainedFaces = $temp$retainedFaces;
							edgesByKey = $temp$edgesByKey;
							continue processFaces;
						} else {
							var $temp$facesToProcess = remainingFaces,
								$temp$newVertex = newVertex,
								$temp$retainedFaces = A2($elm$core$List$cons, firstFace, retainedFaces),
								$temp$edgesByKey = edgesByKey;
							facesToProcess = $temp$facesToProcess;
							newVertex = $temp$newVertex;
							retainedFaces = $temp$retainedFaces;
							edgesByKey = $temp$edgesByKey;
							continue processFaces;
						}
					case 1:
						var firstVertex = firstFace.a;
						var secondVertex = firstFace.b;
						var outerIndex = firstFace.c;
						var edgeDirection = firstFace.d;
						var insideInfiniteCircle = A2(
							$ianmackenzie$elm_units$Quantity$greaterThan,
							$ianmackenzie$elm_units$Quantity$zero,
							A3($ianmackenzie$elm_geometry$DelaunayTriangulation2d$signedDistance, newVertex.h, firstVertex.h, edgeDirection));
						if (insideInfiniteCircle) {
							var secondIndex = secondVertex.u;
							var key2 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, secondIndex, outerIndex);
							var firstIndex = firstVertex.u;
							var key1 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, firstIndex, secondIndex);
							var key3 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, outerIndex, firstIndex);
							var edge3 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$OuterToInnerEdge, outerIndex, firstVertex);
							var edge2 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$InnerToOuterEdge, secondVertex, outerIndex);
							var edge1 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$InnerEdge, firstVertex, secondVertex);
							var updatedEdges = A3(
								$elm$core$Dict$update,
								key3,
								$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge3),
								A3(
									$elm$core$Dict$update,
									key2,
									$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge2),
									A3(
										$elm$core$Dict$update,
										key1,
										$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge1),
										edgesByKey)));
							var $temp$facesToProcess = remainingFaces,
								$temp$newVertex = newVertex,
								$temp$retainedFaces = retainedFaces,
								$temp$edgesByKey = updatedEdges;
							facesToProcess = $temp$facesToProcess;
							newVertex = $temp$newVertex;
							retainedFaces = $temp$retainedFaces;
							edgesByKey = $temp$edgesByKey;
							continue processFaces;
						} else {
							var $temp$facesToProcess = remainingFaces,
								$temp$newVertex = newVertex,
								$temp$retainedFaces = A2($elm$core$List$cons, firstFace, retainedFaces),
								$temp$edgesByKey = edgesByKey;
							facesToProcess = $temp$facesToProcess;
							newVertex = $temp$newVertex;
							retainedFaces = $temp$retainedFaces;
							edgesByKey = $temp$edgesByKey;
							continue processFaces;
						}
					default:
						var delaunayVertex = firstFace.a;
						var firstOuterIndex = firstFace.b;
						var secondOuterIndex = firstFace.c;
						var edgeDirection = firstFace.d;
						var insideInfiniteCircle = A2(
							$ianmackenzie$elm_units$Quantity$lessThan,
							$ianmackenzie$elm_units$Quantity$zero,
							A3($ianmackenzie$elm_geometry$DelaunayTriangulation2d$signedDistance, newVertex.h, delaunayVertex.h, edgeDirection));
						if (insideInfiniteCircle) {
							var vertexIndex = delaunayVertex.u;
							var key3 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, secondOuterIndex, vertexIndex);
							var key2 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, firstOuterIndex, secondOuterIndex);
							var key1 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$edgeKey, vertexIndex, firstOuterIndex);
							var edge3 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$OuterToInnerEdge, secondOuterIndex, delaunayVertex);
							var edge2 = A3($ianmackenzie$elm_geometry$DelaunayTriangulation2d$OuterEdge, edgeDirection, firstOuterIndex, secondOuterIndex);
							var edge1 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$InnerToOuterEdge, delaunayVertex, firstOuterIndex);
							var updatedEdges = A3(
								$elm$core$Dict$update,
								key3,
								$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge3),
								A3(
									$elm$core$Dict$update,
									key2,
									$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge2),
									A3(
										$elm$core$Dict$update,
										key1,
										$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addEdge(edge1),
										edgesByKey)));
							var $temp$facesToProcess = remainingFaces,
								$temp$newVertex = newVertex,
								$temp$retainedFaces = retainedFaces,
								$temp$edgesByKey = updatedEdges;
							facesToProcess = $temp$facesToProcess;
							newVertex = $temp$newVertex;
							retainedFaces = $temp$retainedFaces;
							edgesByKey = $temp$edgesByKey;
							continue processFaces;
						} else {
							var $temp$facesToProcess = remainingFaces,
								$temp$newVertex = newVertex,
								$temp$retainedFaces = A2($elm$core$List$cons, firstFace, retainedFaces),
								$temp$edgesByKey = edgesByKey;
							facesToProcess = $temp$facesToProcess;
							newVertex = $temp$newVertex;
							retainedFaces = $temp$retainedFaces;
							edgesByKey = $temp$edgesByKey;
							continue processFaces;
						}
				}
			} else {
				return _Utils_Tuple2(retainedFaces, edgesByKey);
			}
		}
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$addVertex = F2(
	function (vertex, faces_) {
		var _v0 = A4($ianmackenzie$elm_geometry$DelaunayTriangulation2d$processFaces, faces_, vertex, _List_Nil, $elm$core$Dict$empty);
		var retainedFaces = _v0.a;
		var starEdges = _v0.b;
		return A3(
			$elm$core$Dict$foldl,
			$ianmackenzie$elm_geometry$DelaunayTriangulation2d$addNewFace(vertex),
			retainedFaces,
			starEdges);
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$CoincidentVertices = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$checkDistinctHelp = F2(
	function (previous, sortedDelaunayVertices) {
		checkDistinctHelp:
		while (true) {
			if (!sortedDelaunayVertices.b) {
				return $elm$core$Result$Ok(0);
			} else {
				var first = sortedDelaunayVertices.a;
				var rest = sortedDelaunayVertices.b;
				if (_Utils_eq(previous.h, first.h)) {
					return $elm$core$Result$Err(
						A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$CoincidentVertices, previous.N, first.N));
				} else {
					var $temp$previous = first,
						$temp$sortedDelaunayVertices = rest;
					previous = $temp$previous;
					sortedDelaunayVertices = $temp$sortedDelaunayVertices;
					continue checkDistinctHelp;
				}
			}
		}
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$checkDistinct = function (sortedDelaunayVertices) {
	if (!sortedDelaunayVertices.b) {
		return $elm$core$Result$Ok(0);
	} else {
		var first = sortedDelaunayVertices.a;
		var rest = sortedDelaunayVertices.b;
		return A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$checkDistinctHelp, first, rest);
	}
};
var $elm$core$Elm$JsArray$foldl = _JsArray_foldl;
var $elm$core$Array$foldl = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldl, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldl, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldl,
			func,
			A3($elm$core$Elm$JsArray$foldl, helper, baseCase, tree),
			tail);
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $ianmackenzie$elm_geometry$Point2d$lexicographicComparison = F2(
	function (_v0, _v1) {
		var p1 = _v0;
		var p2 = _v1;
		return (!_Utils_eq(p1.b5, p2.b5)) ? A2($elm$core$Basics$compare, p1.b5, p2.b5) : A2($elm$core$Basics$compare, p1.b6, p2.b6);
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$lexicographicComparison = F2(
	function (firstDelaunayVertex, secondDelaunayVertex) {
		return A2($ianmackenzie$elm_geometry$Point2d$lexicographicComparison, firstDelaunayVertex.h, secondDelaunayVertex.h);
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$prependDelaunayVertex = F3(
	function (getPosition, vertex, accumulated) {
		var index = function () {
			if (!accumulated.b) {
				return 0;
			} else {
				var previous = accumulated.a;
				return previous.u + 1;
			}
		}();
		var newDelaunayVertex = {
			u: index,
			h: getPosition(vertex),
			N: vertex
		};
		return A2($elm$core$List$cons, newDelaunayVertex, accumulated);
	});
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$collectDelaunayVertices = F2(
	function (getPosition, givenVertices) {
		var allDelaunayVertices = A3(
			$elm$core$Array$foldl,
			$ianmackenzie$elm_geometry$DelaunayTriangulation2d$prependDelaunayVertex(getPosition),
			_List_Nil,
			givenVertices);
		var sortedDelaunayVertices = A2($elm$core$List$sortWith, $ianmackenzie$elm_geometry$DelaunayTriangulation2d$lexicographicComparison, allDelaunayVertices);
		var _v0 = $ianmackenzie$elm_geometry$DelaunayTriangulation2d$checkDistinct(sortedDelaunayVertices);
		if (!_v0.$) {
			return $elm$core$Result$Ok(sortedDelaunayVertices);
		} else {
			var coincidentVertices = _v0.a;
			return $elm$core$Result$Err(coincidentVertices);
		}
	});
var $ianmackenzie$elm_geometry$Direction2d$negativeX = {b5: -1, b6: 0};
var $ianmackenzie$elm_geometry$Direction2d$negativeY = {b5: 0, b6: -1};
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$createInitialFaces = function (firstVertex) {
	var topIndex = -1;
	var rightIndex = -3;
	var leftIndex = -2;
	var firstPoint = firstVertex.h;
	return _List_fromArray(
		[
			A4($ianmackenzie$elm_geometry$Geometry$Types$OneVertexFace, firstVertex, topIndex, leftIndex, $ianmackenzie$elm_geometry$Direction2d$positiveY),
			A4($ianmackenzie$elm_geometry$Geometry$Types$OneVertexFace, firstVertex, leftIndex, rightIndex, $ianmackenzie$elm_geometry$Direction2d$negativeX),
			A4($ianmackenzie$elm_geometry$Geometry$Types$OneVertexFace, firstVertex, rightIndex, topIndex, $ianmackenzie$elm_geometry$Direction2d$negativeY)
		]);
};
var $ianmackenzie$elm_geometry$DelaunayTriangulation2d$fromVerticesBy = F2(
	function (getPosition, givenVertices) {
		var _v0 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$collectDelaunayVertices, getPosition, givenVertices);
		if (!_v0.$) {
			var delaunayVertices = _v0.a;
			if (delaunayVertices.b) {
				var firstDelaunayVertex = delaunayVertices.a;
				var remainingDelaunayVertices = delaunayVertices.b;
				var initialFaces = $ianmackenzie$elm_geometry$DelaunayTriangulation2d$createInitialFaces(firstDelaunayVertex);
				var faces_ = A3($elm$core$List$foldl, $ianmackenzie$elm_geometry$DelaunayTriangulation2d$addVertex, initialFaces, remainingDelaunayVertices);
				return $elm$core$Result$Ok(
					$ianmackenzie$elm_geometry$Geometry$Types$DelaunayTriangulation2d(
						{ay: delaunayVertices, aA: faces_, P: givenVertices}));
			} else {
				return $elm$core$Result$Ok($ianmackenzie$elm_geometry$Geometry$Types$EmptyDelaunayTriangulation2d);
			}
		} else {
			var err = _v0.a;
			return $elm$core$Result$Err(err);
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$fromVerticesBy = F2(
	function (getPosition, givenVertices) {
		var _v0 = A2($ianmackenzie$elm_geometry$DelaunayTriangulation2d$fromVerticesBy, getPosition, givenVertices);
		if (!_v0.$) {
			var triangulation = _v0.a;
			return $elm$core$Result$Ok(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$fromDelaunayTriangulation(triangulation));
		} else {
			var _v1 = _v0.a;
			var firstVertex = _v1.a;
			var secondVertex = _v1.b;
			return $elm$core$Result$Err(
				A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$CoincidentVertices, firstVertex, secondVertex));
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$fromPoints = function (points) {
	return A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$fromVerticesBy, $elm$core$Basics$identity, points);
};
var $elm$core$Elm$JsArray$indexedMap = _JsArray_indexedMap;
var $elm$core$Array$indexedMap = F2(
	function (func, _v0) {
		var len = _v0.a;
		var tree = _v0.c;
		var tail = _v0.d;
		var initialBuilder = {
			o: _List_Nil,
			k: 0,
			n: A3(
				$elm$core$Elm$JsArray$indexedMap,
				func,
				$elm$core$Array$tailIndex(len),
				tail)
		};
		var helper = F2(
			function (node, builder) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldl, helper, builder, subTree);
				} else {
					var leaf = node.a;
					var offset = builder.k * $elm$core$Array$branchFactor;
					var mappedLeaf = $elm$core$Array$Leaf(
						A3($elm$core$Elm$JsArray$indexedMap, func, offset, leaf));
					return {
						o: A2($elm$core$List$cons, mappedLeaf, builder.o),
						k: builder.k + 1,
						n: builder.n
					};
				}
			});
		return A2(
			$elm$core$Array$builderToArray,
			true,
			A3($elm$core$Elm$JsArray$foldl, helper, initialBuilder, tree));
	});
var $elm$core$Elm$JsArray$map = _JsArray_map;
var $elm$core$Array$map = F2(
	function (func, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = function (node) {
			if (!node.$) {
				var subTree = node.a;
				return $elm$core$Array$SubTree(
					A2($elm$core$Elm$JsArray$map, helper, subTree));
			} else {
				var values = node.a;
				return $elm$core$Array$Leaf(
					A2($elm$core$Elm$JsArray$map, func, values));
			}
		};
		return A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			A2($elm$core$Elm$JsArray$map, helper, tree),
			A2($elm$core$Elm$JsArray$map, func, tail));
	});
var $author$project$Voronoi$DragStart = function (a) {
	return {$: 2, a: a};
};
var $elm$svg$Svg$circle = $elm$svg$Svg$trustedNode('circle');
var $elm$svg$Svg$Attributes$class = _VirtualDom_attribute('class');
var $elm$svg$Svg$Attributes$cx = _VirtualDom_attribute('cx');
var $elm$svg$Svg$Attributes$cy = _VirtualDom_attribute('cy');
var $elm$svg$Svg$Events$on = $elm$html$Html$Events$on;
var $elm$svg$Svg$Attributes$r = _VirtualDom_attribute('r');
var $author$project$Voronoi$marker = F2(
	function (idx, _v0) {
		var xc = _v0.a;
		var yc = _v0.b;
		return A2(
			$elm$svg$Svg$circle,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$cx(
					$elm$core$String$fromInt(xc)),
					$elm$svg$Svg$Attributes$cy(
					$elm$core$String$fromInt(yc)),
					$elm$svg$Svg$Attributes$r('3'),
					$elm$svg$Svg$Attributes$class('marker'),
					$elm$svg$Svg$Attributes$fill('white'),
					$elm$svg$Svg$Attributes$stroke('black'),
					$elm$svg$Svg$Attributes$strokeWidth('1'),
					A2(
					$elm$svg$Svg$Events$on,
					'mousedown',
					$elm$json$Json$Decode$succeed(
						$author$project$Voronoi$DragStart(idx)))
				]),
			_List_Nil);
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$extrema = function (_v0) {
	var boundingBoxExtrema = _v0;
	return boundingBoxExtrema;
};
var $ianmackenzie$elm_geometry$Point2d$signedDistanceFrom = F2(
	function (_v0, _v1) {
		var axis = _v0;
		var p = _v1;
		var _v2 = axis.D;
		var p0 = _v2;
		var _v3 = axis.B;
		var d = _v3;
		return ((p.b6 - p0.b6) * d.b5) - ((p.b5 - p0.b5) * d.b6);
	});
var $ianmackenzie$elm_units$Quantity$times = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return x * y;
	});
var $ianmackenzie$elm_geometry$LineSegment2d$intersectionWithAxis = F2(
	function (axis, lineSegment) {
		var _v0 = $ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
		var p1 = _v0.a;
		var p2 = _v0.b;
		var d1 = A2($ianmackenzie$elm_geometry$Point2d$signedDistanceFrom, axis, p1);
		var d2 = A2($ianmackenzie$elm_geometry$Point2d$signedDistanceFrom, axis, p2);
		var product = A2($ianmackenzie$elm_units$Quantity$times, d2, d1);
		if (A2($ianmackenzie$elm_units$Quantity$lessThan, $ianmackenzie$elm_units$Quantity$zero, product)) {
			var t = A2(
				$ianmackenzie$elm_units$Quantity$ratio,
				d1,
				A2($ianmackenzie$elm_units$Quantity$minus, d2, d1));
			return $elm$core$Maybe$Just(
				A3($ianmackenzie$elm_geometry$Point2d$interpolateFrom, p1, p2, t));
		} else {
			if (A2($ianmackenzie$elm_units$Quantity$greaterThan, $ianmackenzie$elm_units$Quantity$zero, product)) {
				return $elm$core$Maybe$Nothing;
			} else {
				if (!_Utils_eq(d1, $ianmackenzie$elm_units$Quantity$zero)) {
					return $elm$core$Maybe$Just(p2);
				} else {
					if (!_Utils_eq(d2, $ianmackenzie$elm_units$Quantity$zero)) {
						return $elm$core$Maybe$Just(p1);
					} else {
						if (_Utils_eq(p1, p2)) {
							return $elm$core$Maybe$Just(p1);
						} else {
							return $elm$core$Maybe$Nothing;
						}
					}
				}
			}
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersection = F3(
	function (lineSegment, axis, accumulated) {
		var _v0 = A2($ianmackenzie$elm_geometry$LineSegment2d$intersectionWithAxis, axis, lineSegment);
		if (!_v0.$) {
			var point = _v0.a;
			return A2($elm$core$List$cons, point, accumulated);
		} else {
			return accumulated;
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersections = F3(
	function (trimBox, axis, accumulated) {
		return A3(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersection,
			trimBox.aw,
			axis,
			A3(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersection,
				trimBox.aO,
				axis,
				A3(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersection,
					trimBox.aH,
					axis,
					A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersection, trimBox.aE, axis, accumulated))));
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBesideAxis = F3(
	function (leftAxis, point, accumulated) {
		return A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_units$Quantity$zero,
			A2($ianmackenzie$elm_geometry$Point2d$signedDistanceFrom, leftAxis, point)) ? A2($elm$core$List$cons, point, accumulated) : accumulated;
	});
var $ianmackenzie$elm_geometry$Point2d$centroidHelp = F6(
	function (x0, y0, count, dx, dy, points) {
		centroidHelp:
		while (true) {
			if (points.b) {
				var p = points.a;
				var remaining = points.b;
				var $temp$x0 = x0,
					$temp$y0 = y0,
					$temp$count = count + 1,
					$temp$dx = dx + (p.b5 - x0),
					$temp$dy = dy + (p.b6 - y0),
					$temp$points = remaining;
				x0 = $temp$x0;
				y0 = $temp$y0;
				count = $temp$count;
				dx = $temp$dx;
				dy = $temp$dy;
				points = $temp$points;
				continue centroidHelp;
			} else {
				return {b5: x0 + (dx / count), b6: y0 + (dy / count)};
			}
		}
	});
var $ianmackenzie$elm_geometry$Point2d$centroid = F2(
	function (_v0, rest) {
		var p0 = _v0;
		return A6($ianmackenzie$elm_geometry$Point2d$centroidHelp, p0.b5, p0.b6, 1, 0, 0, rest);
	});
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$deduplicateHelp = F3(
	function (head, rest, accumulated) {
		deduplicateHelp:
		while (true) {
			if (rest.b) {
				var next = rest.a;
				var remaining = rest.b;
				if (_Utils_eq(head, next)) {
					var $temp$head = head,
						$temp$rest = remaining,
						$temp$accumulated = accumulated;
					head = $temp$head;
					rest = $temp$rest;
					accumulated = $temp$accumulated;
					continue deduplicateHelp;
				} else {
					var $temp$head = next,
						$temp$rest = remaining,
						$temp$accumulated = A2($elm$core$List$cons, next, accumulated);
					head = $temp$head;
					rest = $temp$rest;
					accumulated = $temp$accumulated;
					continue deduplicateHelp;
				}
			} else {
				return accumulated;
			}
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$deduplicateAndReverse = function (points) {
	if (points.b) {
		var first = points.a;
		var rest = points.b;
		return A3(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$deduplicateHelp,
			first,
			rest,
			_List_fromArray(
				[first]));
	} else {
		return _List_Nil;
	}
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$constructPolygon = F2(
	function (vertex, points) {
		if (points.b) {
			var first = points.a;
			var rest = points.b;
			var centroid = A2($ianmackenzie$elm_geometry$Point2d$centroid, first, rest);
			var sortedPoints = $ianmackenzie$elm_geometry$VoronoiDiagram2d$deduplicateAndReverse(
				A2(
					$elm$core$List$sortBy,
					A2(
						$elm$core$Basics$composeR,
						$ianmackenzie$elm_geometry$VoronoiDiagram2d$pseudoAngle(centroid),
						$elm$core$Basics$negate),
					points));
			return $elm$core$Maybe$Just(
				_Utils_Tuple2(
					vertex,
					$ianmackenzie$elm_geometry$Polygon2d$singleLoop(sortedPoints)));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$trimHalfPlane = F3(
	function (trimBox, vertex, leftAxis) {
		var trimmedVertices = A3(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBesideAxis,
			leftAxis,
			trimBox.ag,
			A3(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBesideAxis,
				leftAxis,
				trimBox.ah,
				A3(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBesideAxis,
					leftAxis,
					trimBox.aa,
					A3(
						$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBesideAxis,
						leftAxis,
						trimBox._,
						A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersections, trimBox, leftAxis, _List_Nil)))));
		return A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$constructPolygon, vertex, trimmedVertices);
	});
var $ianmackenzie$elm_geometry$Vector2d$dot = F2(
	function (_v0, _v1) {
		var v2 = _v0;
		var v1 = _v1;
		return (v1.b5 * v2.b5) + (v1.b6 * v2.b6);
	});
var $ianmackenzie$elm_geometry$LineSegment2d$intersectionPoint = F2(
	function (lineSegment1, lineSegment2) {
		var s = $ianmackenzie$elm_geometry$LineSegment2d$vector(lineSegment2);
		var r = $ianmackenzie$elm_geometry$LineSegment2d$vector(lineSegment1);
		var _v0 = $ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment2);
		var q = _v0.a;
		var q_ = _v0.b;
		var _v1 = $ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment1);
		var p = _v1.a;
		var p_ = _v1.b;
		var pq = A2($ianmackenzie$elm_geometry$Vector2d$from, p, q);
		var pqXr = A2($ianmackenzie$elm_geometry$Vector2d$cross, r, pq);
		var pqXs = A2($ianmackenzie$elm_geometry$Vector2d$cross, s, pq);
		var pq_ = A2($ianmackenzie$elm_geometry$Vector2d$from, p, q_);
		var rXpq_ = A2($ianmackenzie$elm_geometry$Vector2d$cross, pq_, r);
		var uDenominator = A2($ianmackenzie$elm_units$Quantity$plus, rXpq_, pqXr);
		var qp_ = A2($ianmackenzie$elm_geometry$Vector2d$from, q, p_);
		var sXqp_ = A2($ianmackenzie$elm_geometry$Vector2d$cross, qp_, s);
		var tDenominator = A2($ianmackenzie$elm_units$Quantity$minus, sXqp_, pqXs);
		if (_Utils_eq(tDenominator, $ianmackenzie$elm_units$Quantity$zero) || _Utils_eq(uDenominator, $ianmackenzie$elm_units$Quantity$zero)) {
			return A2(
				$ianmackenzie$elm_units$Quantity$lessThan,
				$ianmackenzie$elm_units$Quantity$zero,
				A2($ianmackenzie$elm_geometry$Vector2d$dot, s, r)) ? (_Utils_eq(p_, q_) ? $elm$core$Maybe$Just(p_) : (_Utils_eq(p, q) ? $elm$core$Maybe$Just(p) : $elm$core$Maybe$Nothing)) : (_Utils_eq(p_, q) ? $elm$core$Maybe$Just(p_) : (_Utils_eq(p, q_) ? $elm$core$Maybe$Just(p) : $elm$core$Maybe$Nothing));
		} else {
			var u = A2($ianmackenzie$elm_units$Quantity$ratio, pqXr, uDenominator);
			var t = A2($ianmackenzie$elm_units$Quantity$ratio, pqXs, tDenominator);
			if (((0 <= t) && (t <= 1)) && ((0 <= u) && (u <= 1))) {
				var intersection = (_Utils_cmp(
					A2($elm$core$Basics$min, t, 1 - t),
					A2($elm$core$Basics$min, u, 1 - u)) < 1) ? A2($ianmackenzie$elm_geometry$LineSegment2d$interpolate, lineSegment1, t) : A2($ianmackenzie$elm_geometry$LineSegment2d$interpolate, lineSegment2, u);
				return $elm$core$Maybe$Just(intersection);
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addEdgeIntersection = F3(
	function (firstLineSegment, secondLineSegment, accumulated) {
		var _v0 = A2($ianmackenzie$elm_geometry$LineSegment2d$intersectionPoint, firstLineSegment, secondLineSegment);
		if (!_v0.$) {
			var point = _v0.a;
			return A2($elm$core$List$cons, point, accumulated);
		} else {
			return accumulated;
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addEdgeIntersections = F3(
	function (trimBox, lineSegment, accumulated) {
		return A3(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addEdgeIntersection,
			trimBox.aw,
			lineSegment,
			A3(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$addEdgeIntersection,
				trimBox.aO,
				lineSegment,
				A3(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addEdgeIntersection,
					trimBox.aH,
					lineSegment,
					A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$addEdgeIntersection, trimBox.aE, lineSegment, accumulated))));
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addAllEdgeIntersections = F3(
	function (trimBox, lineSegments, accumulated) {
		return A3(
			$elm$core$List$foldl,
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addEdgeIntersections(trimBox),
			accumulated,
			lineSegments);
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$contains = F2(
	function (point, boundingBox) {
		return A2(
			$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$minX(boundingBox),
			$ianmackenzie$elm_geometry$Point2d$xCoordinate(point)) && (A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$maxX(boundingBox),
			$ianmackenzie$elm_geometry$Point2d$xCoordinate(point)) && (A2(
			$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$minY(boundingBox),
			$ianmackenzie$elm_geometry$Point2d$yCoordinate(point)) && A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$maxY(boundingBox),
			$ianmackenzie$elm_geometry$Point2d$yCoordinate(point))));
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addContainedPoint = F3(
	function (boundingBox, point, accumulated) {
		return A2($ianmackenzie$elm_geometry$BoundingBox2d$contains, point, boundingBox) ? A2($elm$core$List$cons, point, accumulated) : accumulated;
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addContainedPoints = F3(
	function (trimBox, points, accumulated) {
		return A3(
			$elm$core$List$foldl,
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addContainedPoint(trimBox.aR),
			accumulated,
			points);
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$leftOfSegment = F2(
	function (lineSegment, point) {
		var y = $ianmackenzie$elm_geometry$Point2d$yCoordinate(point);
		var x = $ianmackenzie$elm_geometry$Point2d$xCoordinate(point);
		var _v0 = $ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
		var p1 = _v0.a;
		var p2 = _v0.b;
		var x1 = $ianmackenzie$elm_geometry$Point2d$xCoordinate(p1);
		var y1 = $ianmackenzie$elm_geometry$Point2d$yCoordinate(p1);
		var x2 = $ianmackenzie$elm_geometry$Point2d$xCoordinate(p2);
		var dx = A2($ianmackenzie$elm_units$Quantity$minus, x1, x2);
		var y2 = $ianmackenzie$elm_geometry$Point2d$yCoordinate(p2);
		var dy = A2($ianmackenzie$elm_units$Quantity$minus, y1, y2);
		return A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			A2(
				$ianmackenzie$elm_units$Quantity$times,
				dx,
				A2($ianmackenzie$elm_units$Quantity$minus, y1, y)),
			A2(
				$ianmackenzie$elm_units$Quantity$times,
				dy,
				A2($ianmackenzie$elm_units$Quantity$minus, x1, x)));
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$leftOf = F2(
	function (lineSegments, point) {
		leftOf:
		while (true) {
			if (lineSegments.b) {
				var first = lineSegments.a;
				var rest = lineSegments.b;
				if (A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$leftOfSegment, first, point)) {
					var $temp$lineSegments = rest,
						$temp$point = point;
					lineSegments = $temp$lineSegments;
					point = $temp$point;
					continue leftOf;
				} else {
					return false;
				}
			} else {
				return true;
			}
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideFiniteRegion = F3(
	function (edges, point, accumulated) {
		return A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$leftOf, edges, point) ? A2($elm$core$List$cons, point, accumulated) : accumulated;
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointsInsideFiniteRegion = F3(
	function (edges, trimBox, accumulated) {
		return A3(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideFiniteRegion,
			edges,
			trimBox.aa,
			A3(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideFiniteRegion,
				edges,
				trimBox._,
				A3(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideFiniteRegion,
					edges,
					trimBox.ah,
					A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideFiniteRegion, edges, trimBox.ag, accumulated))));
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$hullHelp = F5(
	function (currentMinX, currentMaxX, currentMinY, currentMaxY, points) {
		hullHelp:
		while (true) {
			if (points.b) {
				var next = points.a;
				var rest = points.b;
				var _v1 = next;
				var x = _v1.b5;
				var y = _v1.b6;
				var $temp$currentMinX = A2($elm$core$Basics$min, x, currentMinX),
					$temp$currentMaxX = A2($elm$core$Basics$max, x, currentMaxX),
					$temp$currentMinY = A2($elm$core$Basics$min, y, currentMinY),
					$temp$currentMaxY = A2($elm$core$Basics$max, y, currentMaxY),
					$temp$points = rest;
				currentMinX = $temp$currentMinX;
				currentMaxX = $temp$currentMaxX;
				currentMinY = $temp$currentMinY;
				currentMaxY = $temp$currentMaxY;
				points = $temp$points;
				continue hullHelp;
			} else {
				return {cl: currentMaxX, cm: currentMaxY, cn: currentMinX, co: currentMinY};
			}
		}
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$hull = F2(
	function (first, rest) {
		var _v0 = first;
		var x = _v0.b5;
		var y = _v0.b6;
		return A5($ianmackenzie$elm_geometry$BoundingBox2d$hullHelp, x, x, y, y, rest);
	});
var $ianmackenzie$elm_geometry$BoundingBox2d$hullN = function (points) {
	if (points.b) {
		var first = points.a;
		var rest = points.b;
		return $elm$core$Maybe$Just(
			A2($ianmackenzie$elm_geometry$BoundingBox2d$hull, first, rest));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $ianmackenzie$elm_geometry$Polygon2d$boundingBox = function (polygon) {
	return $ianmackenzie$elm_geometry$BoundingBox2d$hullN(
		$ianmackenzie$elm_geometry$Polygon2d$outerLoop(polygon));
};
var $ianmackenzie$elm_geometry$BoundingBox2d$isContainedIn = F2(
	function (other, boundingBox) {
		return A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$minX(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox2d$minX(other)) && (A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$maxX(other),
			$ianmackenzie$elm_geometry$BoundingBox2d$maxX(boundingBox)) && (A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$minY(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox2d$minY(other)) && A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_geometry$BoundingBox2d$maxY(other),
			$ianmackenzie$elm_geometry$BoundingBox2d$maxY(boundingBox))));
	});
var $ianmackenzie$elm_geometry$Polygon2d$vertices = function (polygon) {
	return $elm$core$List$concat(
		A2(
			$elm$core$List$cons,
			$ianmackenzie$elm_geometry$Polygon2d$outerLoop(polygon),
			$ianmackenzie$elm_geometry$Polygon2d$innerLoops(polygon)));
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$trimPolygonalRegion = F3(
	function (trimBox, vertex, polygon) {
		var _v0 = $ianmackenzie$elm_geometry$Polygon2d$boundingBox(polygon);
		if (!_v0.$) {
			var polygonBoundingBox = _v0.a;
			if (A2($ianmackenzie$elm_geometry$BoundingBox2d$isContainedIn, trimBox.aR, polygonBoundingBox)) {
				return $elm$core$Maybe$Just(
					_Utils_Tuple2(vertex, polygon));
			} else {
				var polygonVertices = $ianmackenzie$elm_geometry$Polygon2d$vertices(polygon);
				var polygonEdges = $ianmackenzie$elm_geometry$Polygon2d$edges(polygon);
				var trimmedVertices = A3(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointsInsideFiniteRegion,
					polygonEdges,
					trimBox,
					A3(
						$ianmackenzie$elm_geometry$VoronoiDiagram2d$addAllEdgeIntersections,
						trimBox,
						polygonEdges,
						A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$addContainedPoints, trimBox, polygonVertices, _List_Nil)));
				return A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$constructPolygon, vertex, trimmedVertices);
			}
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBetweenAxes = F4(
	function (leftAxis, rightAxis, point, accumulated) {
		return (A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_units$Quantity$zero,
			A2($ianmackenzie$elm_geometry$Point2d$signedDistanceFrom, leftAxis, point)) && A2(
			$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
			$ianmackenzie$elm_units$Quantity$zero,
			A2($ianmackenzie$elm_geometry$Point2d$signedDistanceFrom, rightAxis, point))) ? A2($elm$core$List$cons, point, accumulated) : accumulated;
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$trimStripRegion = F4(
	function (trimBox, vertex, leftAxis, rightAxis) {
		var trimmedVertices = A4(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBetweenAxes,
			leftAxis,
			rightAxis,
			trimBox.ag,
			A4(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBetweenAxes,
				leftAxis,
				rightAxis,
				trimBox.ah,
				A4(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBetweenAxes,
					leftAxis,
					rightAxis,
					trimBox.aa,
					A4(
						$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointBetweenAxes,
						leftAxis,
						rightAxis,
						trimBox._,
						A3(
							$ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersections,
							trimBox,
							rightAxis,
							A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$addFullAxisIntersections, trimBox, leftAxis, _List_Nil))))));
		return A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$constructPolygon, vertex, trimmedVertices);
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addHalfAxisIntersection = F3(
	function (lineSegment, axis, accumulated) {
		var _v0 = A2($ianmackenzie$elm_geometry$LineSegment2d$intersectionWithAxis, axis, lineSegment);
		if (!_v0.$) {
			var point = _v0.a;
			return A2(
				$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
				$ianmackenzie$elm_units$Quantity$zero,
				A2($ianmackenzie$elm_geometry$Point2d$signedDistanceAlong, axis, point)) ? A2($elm$core$List$cons, point, accumulated) : accumulated;
		} else {
			return accumulated;
		}
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addHalfAxisIntersections = F3(
	function (trimBox, axis, accumulated) {
		return A3(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addHalfAxisIntersection,
			trimBox.aw,
			axis,
			A3(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$addHalfAxisIntersection,
				trimBox.aO,
				axis,
				A3(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addHalfAxisIntersection,
					trimBox.aH,
					axis,
					A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$addHalfAxisIntersection, trimBox.aE, axis, accumulated))));
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideInfiniteRegion = F5(
	function (leftAxis, rightAxis, lineSegments, point, accumulated) {
		return (A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$leftOf, lineSegments, point) && (A2(
			$ianmackenzie$elm_units$Quantity$lessThanOrEqualTo,
			$ianmackenzie$elm_units$Quantity$zero,
			A2($ianmackenzie$elm_geometry$Point2d$signedDistanceFrom, leftAxis, point)) && A2(
			$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
			$ianmackenzie$elm_units$Quantity$zero,
			A2($ianmackenzie$elm_geometry$Point2d$signedDistanceFrom, rightAxis, point)))) ? A2($elm$core$List$cons, point, accumulated) : accumulated;
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointsInsideInfiniteRegion = F5(
	function (leftAxis, rightAxis, lineSegments, trimBox, accumulated) {
		return A5(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideInfiniteRegion,
			leftAxis,
			rightAxis,
			lineSegments,
			trimBox.aa,
			A5(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideInfiniteRegion,
				leftAxis,
				rightAxis,
				lineSegments,
				trimBox._,
				A5(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideInfiniteRegion,
					leftAxis,
					rightAxis,
					lineSegments,
					trimBox.ah,
					A5($ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointInsideInfiniteRegion, leftAxis, rightAxis, lineSegments, trimBox.ag, accumulated))));
	});
var $ianmackenzie$elm_geometry$Polyline2d$vertices = function (_v0) {
	var polylineVertices = _v0;
	return polylineVertices;
};
var $ianmackenzie$elm_geometry$Polyline2d$segments = function (polyline) {
	var _v0 = $ianmackenzie$elm_geometry$Polyline2d$vertices(polyline);
	if (!_v0.b) {
		return _List_Nil;
	} else {
		var all = _v0;
		var first = all.a;
		var rest = all.b;
		return A3($elm$core$List$map2, $ianmackenzie$elm_geometry$LineSegment2d$from, all, rest);
	}
};
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$trimUShapedRegion = F5(
	function (trimBox, vertex, leftAxis, rightAxis, polyline) {
		var polylineVertices = $ianmackenzie$elm_geometry$Polyline2d$vertices(polyline);
		var polylineSegments = $ianmackenzie$elm_geometry$Polyline2d$segments(polyline);
		var trimmedVertices = A5(
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$addPointsInsideInfiniteRegion,
			leftAxis,
			rightAxis,
			polylineSegments,
			trimBox,
			A3(
				$ianmackenzie$elm_geometry$VoronoiDiagram2d$addAllEdgeIntersections,
				trimBox,
				polylineSegments,
				A3(
					$ianmackenzie$elm_geometry$VoronoiDiagram2d$addHalfAxisIntersections,
					trimBox,
					rightAxis,
					A3(
						$ianmackenzie$elm_geometry$VoronoiDiagram2d$addHalfAxisIntersections,
						trimBox,
						leftAxis,
						A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$addContainedPoints, trimBox, polylineVertices, _List_Nil)))));
		return A2($ianmackenzie$elm_geometry$VoronoiDiagram2d$constructPolygon, vertex, trimmedVertices);
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$trimRegion = F2(
	function (trimBox, region) {
		switch (region.$) {
			case 0:
				var vertex = region.a;
				var polygon = region.b;
				return A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$trimPolygonalRegion, trimBox, vertex, polygon);
			case 1:
				var vertex = region.a;
				var leftAxis = region.b;
				var rightAxis = region.c;
				var polyline = region.d;
				return A5($ianmackenzie$elm_geometry$VoronoiDiagram2d$trimUShapedRegion, trimBox, vertex, leftAxis, rightAxis, polyline);
			case 2:
				var vertex = region.a;
				var leftAxis = region.b;
				var rightAxis = region.c;
				return A4($ianmackenzie$elm_geometry$VoronoiDiagram2d$trimStripRegion, trimBox, vertex, leftAxis, rightAxis);
			case 3:
				var vertex = region.a;
				var leftAxis = region.b;
				return A3($ianmackenzie$elm_geometry$VoronoiDiagram2d$trimHalfPlane, trimBox, vertex, leftAxis);
			default:
				var vertex = region.a;
				var boundingBoxRectangle = $ianmackenzie$elm_geometry$Polygon2d$singleLoop(
					_List_fromArray(
						[trimBox._, trimBox.aa, trimBox.ah, trimBox.ag]));
				return $elm$core$Maybe$Just(
					_Utils_Tuple2(vertex, boundingBoxRectangle));
		}
	});
var $ianmackenzie$elm_geometry$Point2d$xy = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return {b5: x, b6: y};
	});
var $ianmackenzie$elm_geometry$VoronoiDiagram2d$polygons = F2(
	function (boundingBox, _v0) {
		var voronoiDiagram = _v0;
		var _v1 = $ianmackenzie$elm_geometry$BoundingBox2d$extrema(boundingBox);
		var minX = _v1.cn;
		var minY = _v1.co;
		var maxX = _v1.cl;
		var maxY = _v1.cm;
		var topRightVertex = A2($ianmackenzie$elm_geometry$Point2d$xy, maxX, maxY);
		var topLeftVertex = A2($ianmackenzie$elm_geometry$Point2d$xy, minX, maxY);
		var bottomLeftVertex = A2($ianmackenzie$elm_geometry$Point2d$xy, minX, minY);
		var bottomRightVertex = A2($ianmackenzie$elm_geometry$Point2d$xy, maxX, minY);
		var trimBox = {
			aw: A2($ianmackenzie$elm_geometry$LineSegment2d$from, bottomLeftVertex, bottomRightVertex),
			_: bottomLeftVertex,
			aa: bottomRightVertex,
			aR: boundingBox,
			aE: A2($ianmackenzie$elm_geometry$LineSegment2d$from, topLeftVertex, bottomLeftVertex),
			aH: A2($ianmackenzie$elm_geometry$LineSegment2d$from, bottomRightVertex, topRightVertex),
			aO: A2($ianmackenzie$elm_geometry$LineSegment2d$from, topRightVertex, topLeftVertex),
			ag: topLeftVertex,
			ah: topRightVertex
		};
		return A2(
			$elm$core$List$filterMap,
			$ianmackenzie$elm_geometry$VoronoiDiagram2d$trimRegion(trimBox),
			voronoiDiagram.bh);
	});
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $elm$core$Basics$pi = _Basics_pi;
var $ianmackenzie$elm_units$Angle$degrees = function (numDegrees) {
	return $ianmackenzie$elm_units$Angle$radians($elm$core$Basics$pi * (numDegrees / 180));
};
var $ianmackenzie$elm_geometry$LineSegment2d$mapEndpoints = F2(
	function (_function, lineSegment) {
		var _v0 = $ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
		var p1 = _v0.a;
		var p2 = _v0.b;
		return $ianmackenzie$elm_geometry$LineSegment2d$fromEndpoints(
			_Utils_Tuple2(
				_function(p1),
				_function(p2)));
	});
var $ianmackenzie$elm_geometry$LineSegment2d$rotateAround = F2(
	function (centerPoint, angle) {
		return $ianmackenzie$elm_geometry$LineSegment2d$mapEndpoints(
			A2($ianmackenzie$elm_geometry$Point2d$rotateAround, centerPoint, angle));
	});
var $author$project$Voronoi$flip = function (segment) {
	var pivot = $ianmackenzie$elm_geometry$LineSegment2d$midpoint(segment);
	var angle = $ianmackenzie$elm_units$Angle$degrees(180);
	return A3($ianmackenzie$elm_geometry$LineSegment2d$rotateAround, pivot, angle, segment);
};
var $author$project$Voronoi$tongueFilterMap = F2(
	function (edgeDict, edge) {
		var flipIf = function (orientation) {
			if (!orientation) {
				return edge;
			} else {
				return $author$project$Voronoi$flip(edge);
			}
		};
		return A2(
			$elm$core$Maybe$map,
			flipIf,
			A2(
				$elm$core$Dict$get,
				$author$project$Voronoi$lineCoord(edge),
				edgeDict));
	});
var $elm_community$list_extra$List$Extra$uniqueBy = F2(
	function (f, list) {
		return A4($elm_community$list_extra$List$Extra$uniqueHelp, f, _List_Nil, list, _List_Nil);
	});
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (!result.$) {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Voronoi$draw = function (model) {
	var points = A2(
		$elm$core$Array$map,
		function (_v0) {
			var x = _v0.a;
			var y = _v0.b;
			return A2($ianmackenzie$elm_geometry$Point2d$unitless, x, y);
		},
		model.Y);
	var voronoi = A2(
		$elm$core$Result$withDefault,
		$ianmackenzie$elm_geometry$VoronoiDiagram2d$empty,
		$ianmackenzie$elm_geometry$VoronoiDiagram2d$fromPoints(points));
	var polygons = A2(
		$ianmackenzie$elm_geometry$VoronoiDiagram2d$polygons,
		A2(
			$ianmackenzie$elm_geometry$BoundingBox2d$from,
			A2($ianmackenzie$elm_geometry$Point2d$unitless, 0, 0),
			A2($ianmackenzie$elm_geometry$Point2d$unitless, 800, 600)),
		voronoi);
	var markers = $elm$core$Array$toList(
		A2(
			$elm$core$Array$indexedMap,
			$author$project$Voronoi$marker,
			A2(
				$elm$core$Array$map,
				function (p) {
					return _Utils_Tuple2(
						$elm$core$Basics$round(p.b5),
						$elm$core$Basics$round(p.b6));
				},
				A2($elm$core$Array$map, $ianmackenzie$elm_geometry$Point2d$toUnitless, points))));
	var edges = A2(
		$elm_community$list_extra$List$Extra$uniqueBy,
		$author$project$Voronoi$lineCoord,
		A2(
			$elm$core$List$concatMap,
			$ianmackenzie$elm_geometry$Polygon2d$edges,
			A2($elm$core$List$map, $elm$core$Tuple$second, polygons)));
	var svgEdges = A2(
		$elm$core$List$map,
		$author$project$Voronoi$drawEdge(model.J),
		edges);
	var tongues = A2(
		$elm$core$List$map,
		$author$project$Voronoi$drawWiggly,
		A2(
			$elm$core$List$map,
			$author$project$Voronoi$fitWiggly($author$project$Voronoi$baseWiggly),
			A2(
				$elm$core$List$filterMap,
				$author$project$Voronoi$tongueFilterMap(model.J),
				edges)));
	return A3(
		$author$project$Voronoi$canvas,
		800,
		600,
		_List_fromArray(
			[
				A2($elm$svg$Svg$g, _List_Nil, svgEdges),
				A2($elm$svg$Svg$g, _List_Nil, markers),
				A2($elm$svg$Svg$g, _List_Nil, tongues)
			]));
};
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $author$project$Voronoi$view = function (model) {
	return {
		ca: _List_fromArray(
			[
				$elm$html$Html$text(''),
				$author$project$Voronoi$draw(model)
			]),
		cy: 'puzzleface'
	};
};
var $author$project$Voronoi$main = $elm$browser$Browser$document(
	{cj: $author$project$Voronoi$init, cx: $author$project$Voronoi$subscriptions, cz: $author$project$Voronoi$update, cA: $author$project$Voronoi$view});
_Platform_export({'Voronoi':{'init':$author$project$Voronoi$main(
	$elm$json$Json$Decode$succeed(0))(0)}});}(this));