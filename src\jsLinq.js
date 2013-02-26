//-----------------------------------------------------------------------
// Part of the LINQ to JavaScript (Q) v1.0.0 Project - http://jshibernate.com/
// Copyright (C) 2013 JsHibernate (http://jshibernate.com). all rights reserved.
// This project is licensed under the Microsoft Reciprocal License (Ms-RL)
// This license can be found here: http://jshibernate.com/
// Document refrence http://msdn.microsoft.com/en-us/library/bb341635.aspx
//-----------------------------------------------------------------------

(function () {

    Array.prototype.toString = function () { return "[object Array]"; }

    Q = window.Q = q = window.q = function (source) {
        return new Q.fn.init(source);
    };

    //Static API
    //    jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
    //        class2type["[object " + name + "]"] = name.toLowerCase();
    //    });

    Q.t = Q.types = {
        bool: typeof true,
        number: typeof 0,
        string: typeof "",
        object: {}.toString(),
        array: [].toString(),
        undef: typeof undefined,
        func: typeof function () { },
        isBool: function (v) { return typeof v === Q.t.bool; },
        isNumber: function (v) { return typeof v === Q.t.number; },
        isString: function (v) { return typeof v === Q.t.string; },
        isObject: function (v) { return v.toString() === Q.t.object; },
        isArray: function (v) { return v.toString() === Q.t.array; },
        isUndef: function (v) { return typeof v === Q.t.undef; },
        isFunc: function (v) { return typeof v === Q.t.func; },
        isQ: function (v) { return v instanceof Q },
        isDate: function (v) { return v instanceof Date; },
        convertor: function (type, v) {
            switch (type) {
                case Q.t.bool:
                    return v ? true : false;

                case Q.t.number:
                    var fv = parseFloat(v);
                    return isNan(fvalue) ? 0 : fv;

                case Q.t.string:
                    return String(v);

                default:
                    return v; //Other convertion will be handled in upcomming releases
            }
        }
    }

    Q.from = function (v) {
        if (v == null || Q.t.isUndef(v))
            return Q([]);

        if (Q.t.isQ(v))
            return v;

        if (Q.t.isBool(v) || Q.t.isNumber(v))
            return Q.repeat(v, 1);

        if (Q.t.isArray(v))
            return Q(v);

        if (Q.t.isString(v)) {
            var result = [];
            for (var index = 0; index < v.length; index++)
                result.push(v.charAt(index));
            return Q(result);
        }

        if (Q.t.isObject(v)) {
            var result = [];
            for (var k in v) {
                if (v.hasOwnProperty(k))
                    result.push(k);
            }
            return Q(result);
        }
    };

    Q.repeat = function (element, count) {
        var result = [];
        for (var index = 0; index < count; index++)
            result.push(element);

        return Q(result);
    };

    Q.fn = Q.prototype =
	{
	    version: '1.0.0',

	    init: function (source) {

	        this.$ = source;
	    },

	    /* aggregate:
	    //     Applies an accumulator function over a sequence. The specified seed value
	    //     is used as the initial accumulator value.
	    //
	    // Parameters:
	    //   func:
	    //		An accumulator function to be invoked on each element.
	    //
	    //   accumulator:
	    //     The initial accumulator value.
	    //
	    // Returns:
	    //     The final accumulator value.*/
	    //http://msdn.microsoft.com/en-us/library/bb548744.aspx
	    aggregate: function (func, accumulator) {
	        var result;
	        func = func || function (a, b) { return b ? a + b : a; };

	        for (var k = 0; k < this.$.length; k++) {

	            result = func.call(this, this.$[k], result);
	        }

	        return accumulator + result;
	    },

	    /* sum:
	    //     Computes the sum of the sequence of System.Int64 values that are obtained
	    //     by invoking a transform function on each element of the input sequence.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence of values that are used to calculate a sum.
	    //
	    //   selector:
	    //     A transform function to apply to each element.
	    //
	    // Returns:
	    //     The sum of the projected values.*/
	    sum: function (selector) {
	        var result = 0;

	        if (!selector)
	            result = this.aggregate(null, result);

	        for (var k = 0; k < this.$.length; k++)
	            result += (selector.call(this, this.$[k], k) || 0);

	        return result;
	    },


	    /* max:
	    //     Invokes a transform function on each element of a sequence and returns the
	    //     maximum nullable System.Decimal value.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence of values to determine the maximum value of.
	    //
	    //   selector:
	    //     A transform function to apply to each element.
	    //
	    // Returns:
	    //     The value of type Nullable<Decimal> in C# or Nullable(Of Decimal) in Visual
	    //     Basic that corresponds to the maximum value in the sequence.*/
	    max: function (selector, comparer) {

	        var result = null, comparer = comparer || function (a, b) { return a < b ? b : a; };
	        for (var k = 0; k < this.$.length; k++) {
	            var canSelect = predicate ? predicate.call(this, this.$[k], k) : true;
	            if (canSelect) {
	                var selection = selector ? selector.call(this, this.$[k], k) : this.$[k];
	                result = (result == null) ? selection : comparer.call(this, result, selection)
	            }
	        }

	        return result;
	    },

	    /* min:
	    //     Invokes a transform function on each element of a generic sequence and returns
	    //     the minimum resulting value.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence of values to determine the minimum value of.
	    //
	    //   selector:
	    //     A transform function to apply to each element.
	    //
	    // Returns:
	    //     The minimum value in the sequence.*/
	    min: function (selector) {

	        var result = null, comparer = comparer || function (a, b) { return a > b ? b : a; };
	        for (var k = 0; k < this.$.length; k++) {
	            var canSelect = predicate ? predicate.call(this, this.$[k], k) : true;
	            if (canSelect) {
	                var selection = selector ? selector.call(this, this.$[k], k) : this.$[k];
	                result = (result == null) ? selection : comparer.call(this, result, selection)
	            }
	        }

	        return result;
	    },


	    /* average:
	    //     Computes the average of a sequence of System.Int64 values that are obtained
	    //     by invoking a transform function on each element of the input sequence.
	    //
	    // Parameters:
	    //   selector:
	    //     A transform function to apply to each element.
	    //
	    // Returns:
	    //     The average of the sequence of values.
	    */
	    average: function (selector) {
	        var total = 0, count = 0;

	        if (!selector)
	            selector = function (a) { return a; };

	        for (var k = 0; k < this.$.length; k++) {
	            total += (selector) ? selector.call(this, this.$[k], k) : this.$[k];
	            count++;
	        }
	        return count > 0 ? total / count : 0;
	    },

	    /* all:
	    //     Determines whether all elements of a sequence satisfy a condition.
	    //
	    // Parameters:
	    //   predicate:
	    //     A function to test each element for a condition.
	    //
	    // Returns:
	    //     true if every element of the source sequence passes the test in the specified
	    //     predicate, or if the sequence is empty; otherwise, false.
	    */
	    all: function (predicate) {
	        if (!this.$.length)
	            return false;

	        if (!predicate)
	            return true;

	        for (var k = 0; k < this.$.length; k++) {
	            if (predicate.call(this, this.$[k], k) !== true)
	                return false;
	        }

	        return true;
	    },

	    /* any:
	    //     Determines whether any element of a sequence satisfies a condition.
	    //
	    // Parameters:
	    //
	    //   predicate:
	    //     A function to test each element for a condition.
	    //
	    // Returns:
	    //     true if any elements in the source sequence pass the test in the specified
	    //     predicate; otherwise, false.
	    */
	    any: function (predicate) {
	        if (!this.$.length)
	            return false;

	        if (!predicate)
	            return true;

	        for (var k = 0; k < this.$.length; k++) {
	            if (predicate.call(this, this.$[k], k) === true)
	                return true;
	        }
	        return false;
	    },

	    /* cast:
	    //     Converts the elements of an System.Collections.IEnumerable to the specified
	    //     type.
	    //
	    // Parameters:
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains each element of
	    //     the source sequence converted to the specified type.
	    //
	    */
	    cast: function (type, valueSelector, convertor) {
	        var result = [], convertor = convertor || Q.types.convertor;

	        for (var k = 0; k < this.$.length; k++) {
	            var value = valueSelector ? valueSelector.call(this, this.$[k], k) : this.$[k];
	            value = convertor ? convertor.call(this, type, value) : value;
	            result.push(value);
	        }
	        return Q(result);
	    },

	    /* concat:
	    //     Concatenates two sequences.
	    //
	    // Parameters:
	    //   second:
	    //     The sequence to concatenate to the first sequence.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains the concatenated
	    //     elements of the two input sequences.*/
	    concat: function (second) {
	        var first = this.$,
				second = second.$ || second;

	        return Q(first.concat(second));
	    },

	    /* contains:
	    //     Determines whether a sequence contains a specified element by using a specified
	    //     System.Collections.Generic.IEqualityComparer<T>.
	    //
	    // Parameters:
	    //   value:
	    //     The value to locate in the sequence.
	    //
	    //   comparer:
	    //     An equality comparer to compare values.
	    //
	    // Returns:
	    //     true if the source sequence contains an element that has the specified value;
	    //     otherwise, false.*/
	    contains: function (value, comparer) {

	        comparer = comparer || function (a, b) { return this.isEqual(a, b); }

	        for (var k = 0; k < this.$.length; k++) {
	            if (comparer.call(this, value, this.$[k]))
	                return true;
	        }
	        return false;
	    },

	    /* count:
	    //     Returns a number that represents how many elements in the specified sequence
	    //     satisfy a condition.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence that contains elements to be tested and counted.
	    //
	    //   predicate:
	    //     A function to test each element for a condition.
	    //
	    // Returns:
	    //     A number that represents how many elements in the sequence satisfy the condition
	    //     in the predicate function.*/
	    count: function (predicate) {
	        if (!predicate)
	            return this.$.length;

	        return this.where(predicate).count();
	    },

	    /* distinct:
	    //     Returns distinct elements from a sequence by using a specified System.Collections.Generic.IEqualityComparer<T>
	    //     to compare values.
	    //
	    // Parameters:
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to compare values.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains distinct elements
	    //     from the source sequence.*/
	    distinct: function (comparer) {
	        //Need to validate 
	        if (!this.$ || this.$.length == 0)
	            return Q([]);

	        comparer = comparer || function (a) { return a; };
	        var result = [], hash = {};

	        for (var k = 0; k < this.$.length; k++) {
	            var value = comparer.call(this, this.$[k], k);
	            if (typeof value != 'undefined' && value != null && !hash[value]) {
	                result.push(this.$[k]);
	                hash[value] = true;
	            }
	        }

	        return Q(result);
	    },

	    /* elementAt:
	    //     Returns the element at a specified index in a sequence.
	    //
	    // Parameters:
	    //   source:
	    //     An System.Collections.Generic.IEnumerable<T> to return an element from.
	    //
	    //   index:
	    //     The zero-based index of the element to retrieve.
	    //
	    // Returns:
	    //     The element at the specified position in the source sequence.*/
	    elementAt: function (index, defaultElement) {

	        if (Q.t.isUndef(defaultElement))
	            defaultElement = null;

	        if (this.isEmpty() || index < 0 || index >= this.$.length)
	            return defaultElement;

	        return this.$[index];
	    },


	    /* isEmpty:
	    //     Returns an empty System.Collections.Generic.IEnumerable<T> that has the specified
	    //     type argument.
	    //
	    // Returns:
	    //     An empty System.Collections.Generic.IEnumerable<T> whose type argument is
	    //     TResult. */
	    isEmpty: function () {
	        return !this.$.length;
	    },

	    /* except:
	    //     Produces the set difference of two sequences by using the specified System.Collections.Generic.IEqualityComparer<T>
	    //     to compare values.
	    //
	    // Parameters:
	    //   second:
	    //     An System.Collections.Generic.IEnumerable<T> whose elements that also occur
	    //     in the first sequence will cause those elements to be removed from the returned
	    //     sequence.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to compare values.
	    //
	    // Returns:
	    //     A sequence that contains the set difference of the elements of two sequences.*/
	    except: function (second, comparer) {
	        //Need to validate 
	        second = second.$ || second;

	        if (this.isEmpty())
	            return (!second || !second.length) ? null : Q(second);

	        if (!second || !second.length)
	            return this;

	        var result = [], secondLinQ = second.$ ? second : Q(second);

	        for (var k = 0; k < this.$.length; k++) {
	            var value = this.$[k];
	            var single = secondLinQ.single(function (a) { return !this.isEqual(a, value); });
	            if (!comparer(value, single)) {
	                result.push(value);
	            }
	        }

	        return Q(result);
	    },

	    /* first:
	    //     Returns the first element in a sequence that satisfies a specified condition.
	    //
	    // Parameters:
	    //   source:
	    //     An System.Collections.Generic.IEnumerable<T> to return an element from.
	    //
	    //   predicate:
	    //     A function to test each element for a condition.
	    //
	    // Returns:
	    //     The first element in the sequence that passes the test in the specified predicate
	    //     function.*/
	    first: function (predicate) {
	        if (predicate)
	            return this.where(predicate).first();
	        else
	            return (this.$.length > 0) ? this.$[0] : null;
	    },

	    /* groupBy:
	    //     Groups the elements of a sequence according to a specified k selector function
	    //     and creates a result value from each group and its k. Key values are compared
	    //     by using a specified comparer, and the elements of each group are projected
	    //     by using a specified function.
	    //
	    // Parameters:
	    //   source:
	    //     An System.Collections.Generic.IEnumerable<T> whose elements to group.
	    //
	    //   keySelector:
	    //     A function to extract the k for each element.
	    //
	    //   elementSelector:
	    //     A function to map each source element to an element in an System.Linq.IGrouping<TKey,TElement>.
	    //
	    //   resultSelector:
	    //     A function to create a result value from each group.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to compare keys with.
	    //
	    // Returns:
	    //     A collection of elements of type TResult where each element represents a
	    //     projection over a group and its k. */
	    groupBy: function (keySelector, elementSelector, resultSelector, comparer) {
	        //Need to validate 
	        var result = [];
	        comparer = comparer || function (a, b) { return true; };
	        for (var k = 0; k < this.$.length; k++) {
	            if (comparer.call(this, this.$[k], k)) {
	                var groupingKey = keySelector ? keySelector.call(this, this.$[k], k) : this.$[k];
	                result[groupingKey] = result[groupingKey] || [];

	                var element = elementSelector ? elementSelector.call(this, this.$[k], k) : this.$[k];

	                result[groupingKey].push(resultSelector ? resultSelector.call(this, element, groupingKey) : element);
	            }
	        }
	        return Q(result);
	    },

	    /* groupJoin:
	    //     Correlates the elements of two sequences based on k equality and groups
	    //     the results. A specified System.Collections.Generic.IEqualityComparer<T>
	    //     is used to compare keys.
	    //
	    // Parameters:
	    //   outer:
	    //     The first sequence to join.
	    //
	    //   inner:
	    //     The sequence to join to the first sequence.
	    //
	    //   outerKeySelector:
	    //     A function to extract the join k from each element of the first sequence.
	    //
	    //   innerKeySelector:
	    //     A function to extract the join k from each element of the second sequence.
	    //
	    //   resultSelector:
	    //     A function to create a result element from an element from the first sequence
	    //     and a collection of matching elements from the second sequence.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to hash and compare keys.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains elements of type
	    //     TResult that are obtained by performing a grouped join on two sequences.*/
	    groupJoin: function (inner, outerKeySelector, innerKeySelector, resultSelector, comparer) {

	        //not clear
	    },

	    /* intersect:
	    //     Produces the set intersection of two sequences by using the specified System.Collections.Generic.IEqualityComparer<T>
	    //     to compare values.
	    //
	    // Parameters:
	    //   first:
	    //     An System.Collections.Generic.IEnumerable<T> whose distinct elements that
	    //     also appear in second will be returned.
	    //
	    //   second:
	    //     An System.Collections.Generic.IEnumerable<T> whose distinct elements that
	    //     also appear in the first sequence will be returned.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to compare values.
	    //
	    // Returns:
	    //     A sequence that contains the elements that form the set intersection of two
	    //     sequences.*/
	    //http://msdn.microsoft.com/en-us/library/bb534675.aspx
	    intersect: function (second, comparer) {
	        // Need a validation 
	        return this.union(second, comparer || function (a, index1, b, index2) { return this.isEqual(a, b); });
	    },

	    /* join:
	    //     Correlates the elements of two sequences based on matching keys. A specified
	    //     System.Collections.Generic.IEqualityComparer<T> is used to compare keys.
	    //
	    // Parameters:
	    //   outer:
	    //     The first sequence to join.
	    //
	    //   inner:
	    //     The sequence to join to the first sequence.
	    //
	    //   outerKeySelector:
	    //     A function to extract the join k from each element of the first sequence.
	    //
	    //   innerKeySelector:
	    //     A function to extract the join k from each element of the second sequence.
	    //
	    //   resultSelector:
	    //     A function to create a result element from two matching elements.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to hash and compare keys.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that has elements of type TResult
	    //     that are obtained by performing an inner join on two sequences.*/
	    //http://msdn.microsoft.com/en-us/library/bb397908.aspx
	    join: function (second, outerKeySelector, innerKeySelector, resultSelector, comparer) {
	        //Need to validate 
	        var result = [], second = second.$ || second;
	        for (var k = 0; k < this.$.length; k++) {
	            var v1 = outerKeySelector ? outerKeySelector.call(this, this.$[k], k) : this.$[k];

	            for (var k1 = 0; k1 < second.length; k1++) {
	                var v2 = innerKeySelector ? innerKeySelector.call(this, second[k1], k1) : second[k1];
	                var canProceed = comparer ? comparer.call(this, v1, k, v2, k1) : true;
	                if (canProceed && this.isEqual(v1, v2)) {
	                    result.push(resultSelector ? resultSelector.call(this, v1, k, v2, k1) : v1);
	                }
	            }
	        }

	        return Q(result);
	    },

	    /* last:
	    //     Returns the last element of a sequence that satisfies a specified condition.
	    //
	    // Parameters:
	    //   source:
	    //     An System.Collections.Generic.IEnumerable<T> to return an element from.
	    //
	    //   predicate:
	    //     A function to test each element for a condition.
	    //
	    // Returns:
	    //     The last element in the sequence that passes the test in the specified predicate
	    //     function.*/
	    last: function (predicate) {
	        if (predicate) {
	            return this.where(predicate).last();
	        }
	        else {
	            return (this.$.length > 0) ? this.$[this.$.length - 1] : null;
	        }
	    },

	    /*// ofType:
	    //     Filters the elements of an System.Collections.IEnumerable based on a specified
	    //     type.
	    //
	    // Parameters:
	    //   source:
	    //     The System.Collections.IEnumerable whose elements to filter.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains elements from
	    //     the input sequence of type TResult.*/
	    ofType: function (type, valueSelector) {

	        var first = this.elementAt(0);
	        return (typeof first === type);
	    },

	    /* orderBy:
	    //     Sorts the elements of a sequence in ascending order by using a specified
	    //     comparer.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence of values to order.
	    //
	    //   keySelector:
	    //     A function to extract a k from an element.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IComparer<T> to compare keys.
	    //
	    // Returns:
	    //     An System.Linq.IOrderedEnumerable<TElement> whose elements are sorted according
	    //     to a k.*/
	    orderBy: function (comparer) {

	        return this.sort(comparer);
	    },

	    /* orderByDescending:
	    //     Sorts the elements of a sequence in descending order by using a specified
	    //     comparer.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence of values to order.
	    //
	    //   keySelector:
	    //     A function to extract a k from an element.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IComparer<T> to compare keys.
	    //
	    // Returns:
	    //     An System.Linq.IOrderedEnumerable<TElement> whose elements are sorted in
	    //     descending order according to a k.*/
	    orderByDescending: function (comparer) {
	        //Need to validate 
	        return this.sort(comparer, -1);
	    },

	    /* range:
	    //     Generates a sequence of integral numbers within a specified range.
	    //
	    // Parameters:
	    //   start:
	    //     The value of the first integer in the sequence.
	    //
	    //   count:
	    //     The number of sequential integers to generate.
	    //
	    //   selector:
	    //     The selector will take value, start and count inputs and returns selection.
	    //
	    // Returns:
	    //     TResult contains a range of sequential elements.*/
	    range: function (start, count, selector) {

	        var result = [];
	        if (typeof start != 'Number' || typeof count != 'Number')
	            return Q(result);

	        for (var k = start; k < count; k++) {
	            result.push(selector ? selector.call(this, k, start, count) : k);
	        }

	        return Q(result);
	    },

	    /* repeat:
	    //     Generates a sequence that contains one repeated value.
	    //
	    // Parameters:
	    //   element:
	    //     The value to be repeated.
	    //
	    //   count:
	    //     The number of times to repeat the value in the generated sequence.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains a repeated value.*/
	    repeat: function (element, count) {
	        return Q.repeat(element, count);
	    },

	    /* reverse:
	    //     Inverts the order of the elements in a sequence.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence of values to reverse.
	    //
	    // Returns:
	    //     A sequence whose elements correspond to those of the input sequence in reverse
	    //     order.*/
	    reverse: function () {

	        this.$.reverse()

	        return this;
	    },

	    /* select:
	    //     Projects each element of a sequence into a new form.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence of values to invoke a transform function on.
	    //
	    //   selector:
	    //     A transform function to apply to each element.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> whose elements are the result
	    //     of invoking the transform function on each element of source.*/
	    select: function (predicate, selector) {
	        //Need to validate 
	        var result = [];
	        for (var k = 0; k < this.$.length; k++) {
	            var canSelect = predicate ? predicate.call(this, this.$[k], k) : true;
	            if (canSelect) {
	                var selection = selector ? selector.call(this, this.$[k], k) : this.$[k];
	                if (selection != null && typeof selection != 'undefined')
	                    result.push(selection);
	            }
	        }

	        return Q(result);
	    },

	    /* selectMany:
	    //     Projects each element of a sequence to an System.Collections.Generic.IEnumerable<T>,
	    //     flattens the resulting sequences into one sequence, and invokes a result
	    //     selector function on each element therein. The index of each source element
	    //     is used in the intermediate projected form of that element.
	    //
	    // Parameters:
	    //   source:
	    //     A sequence of values to project.
	    //
	    //   collectionSelector:
	    //     A transform function to apply to each source element; the second parameter
	    //     of the function represents the index of the source element.
	    //
	    //   resultSelector:
	    //     A transform function to apply to each element of the intermediate sequence.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> whose elements are the result
	    //     of invoking the one-to-many transform function collectionSelector on each
	    //     element of source and then mapping each of those sequence elements and their
	    //     corresponding source element to a result element.*/
	    selectMany: function (collectionSelector, resultSelector, predicate) {
	        //Need to validate 
	        var result = [];
	        for (var k = 0; k < this.$.length; k++) {
	            var selection = collectionSelector ? collectionSelector.call(this, this.$[k], k) : this.$[k];
	            var canSelect = predicate ? predicate.call(this, selection) : true;
	            if (canSelect) {
	                if (selection != null && typeof selection != 'undefined')
	                    result.push(resultSelector ? resultSelector.call(this, selection) : selection);
	            }
	        }

	        return Q(result);
	    },

	    /* sequenceEqual:
	    //     Determines whether two sequences are equal by comparing their elements by
	    //     using a specified System.Collections.Generic.IEqualityComparer<T>.
	    //
	    // Parameters:
	    //   first:
	    //     An System.Collections.Generic.IEnumerable<T> to compare to second.
	    //
	    //   second:
	    //     An System.Collections.Generic.IEnumerable<T> to compare to the first sequence.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to use to compare elements.
	    //
	    // Returns:
	    //     true if the two source sequences are of equal length and their corresponding
	    //     elements compare equal according to comparer; otherwise, false.*/
	    sequenceEqual: function (second, comparer) {
	        //Need to validate 	
	        second = second.$ || second;
	        var one = comparer ? this.where(comparer) : this.$;
	        var two = comparer ? Q(second).where(comparer) : second;

	        if (one.length != two.length)
	            return false;

	        for (var k in one) {
	            if (this.isEqual(one[k], two[k]) !== true)
	                return false;
	        }
	        return true;
	    },

	    /* single:
	    //     Returns the only element of a sequence that satisfies a specified condition,
	    //     and throws an exception if more than one such element exists.
	    //
	    // Parameters:
	    //   source:
	    //     An System.Collections.Generic.IEnumerable<T> to return a single element from.
	    //
	    //   predicate:
	    //     A function to test an element for a condition.
	    //
	    // Returns:
	    //     The single element of the input sequence that satisfies a condition.*/
	    single: function (predicate, defaultElement) {
	        var result = this.where(predicate).first();
	        return result == null ? defaultElement : result;
	    },

	    /* skip:
	    //     Bypasses a specified number of elements in a sequence and then returns the
	    //     remaining elements.
	    //
	    // Parameters:
	    //   source:
	    //     An System.Collections.Generic.IEnumerable<T> to return elements from.
	    //
	    //   count:
	    //     The number of elements to skip before returning the remaining elements.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains the elements that
	    //     occur after the specified index in the input sequence.*/
	    skip: function (count) {
	        var result = [];
	        if (count > -1 && count < this.$.length) {
	            for (var index = count; index < this.$.length; index++)
	                result.push(this.$[index]);
	        }
	        return Q(result);
	    },

	    /* skipWhile:
	    //     Bypasses elements in a sequence as long as a specified condition is true
	    //     and then returns the remaining elements. The element's index is used in the
	    //     logic of the predicate function.
	    //
	    // Parameters:
	    //   source:
	    //     An System.Collections.Generic.IEnumerable<T> to return elements from.
	    //
	    //   predicate:
	    //     A function to test each source element for a condition; the second parameter
	    //     of the function represents the index of the source element.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains the elements from
	    //     the input sequence starting at the first element in the linear series that
	    //     does not pass the test specified by predicate.*/
	    skipWhile: function (predicate) {
	        return this.skip(this.indexOf(predicate));
	    },



	    /* take:
	    //     Returns a specified number of contiguous elements from the start of a sequence.
	    //
	    // Parameters:
	    //   source:
	    //     The sequence to return elements from.
	    //
	    //   count:
	    //     The number of elements to return.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains the specified
	    //     number of elements from the start of the input sequence.*/
	    take: function (count) {
	        var result = [];
	        for (var k = 0; k < this.$.length; k++) {
	            if (k < count)
	                break;

	            result.push(this.$[k]);
	        }
	        return Q(result);
	    },

	    /* takeWhile:
	    //     Returns elements from a sequence as long as a specified condition is true.
	    //     The element's index is used in the logic of the predicate function.
	    //
	    // Parameters:
	    //   source:
	    //     The sequence to return elements from.
	    //
	    //   predicate:
	    //     A function to test each source element for a condition; the second parameter
	    //     of the function represents the index of the source element.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains elements from
	    //     the input sequence that occur before the element at which the test no longer
	    //     passes.*/
	    takeWhile: function (predicate) {
	        return this.take(this.indexOf(predicate));
	    },

	    /*// ToArray:
	    //     Creates an array from a System.Collections.Generic.IEnumerable<T>.
	    //
	    // Parameters:
	    //   source:
	    //     An System.Collections.Generic.IEnumerable<T> to create an array from.
	    //
	    // Returns:
	    //     An array that contains the elements from the input sequence.*/
	    ToArray: function () {
	        //if not Array - convert to array
	        return this.$;
	    },

	    /*// toDictionary:
	    //     Creates a System.Collections.Generic.Dictionary<TKey,TValue> from an System.Collections.Generic.IEnumerable<T>
	    //     according to a specified k selector function, a comparer, and an element
	    //     selector function.
	    //
	    // Parameters:
	    //   keySelector:
	    //     A function to extract a k from each element.
	    //
	    //   elementSelector:
	    //     A transform function to produce a result element value from each element.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to compare keys.
	    //
	    // Returns:
	    //     A System.Collections.Generic.Dictionary<TKey,TValue> that contains values
	    //     of type TElement selected from the input sequence.*/
	    toDictionary: function (keySelector, elementSelector, comparer) {
	        var result = {};

	        for (var k = 0; k < this.$.length; k++) {
	            var canDo = comparer ? comparer.call(this, this.$[k], k) : true;
	            if (canDo) {
	                var newkey = keySelector ? keySelector.call(this, this.$[k], k) : k;
	                var value = elementSelector ? elementSelector.call(this, this.$[k], k, newkey) : this.$[k];

	                result[newkey] = value;
	            }
	        }

	        return result;
	    },

	    /* toLookup:
	    //     Creates a System.Linq.Lookup<TKey,TElement> from an System.Collections.Generic.IEnumerable<T>
	    //     according to a specified k selector function, a comparer and an element
	    //     selector function.
	    //
	    // Parameters:
	    //   source:
	    //     The System.Collections.Generic.IEnumerable<T> to create a System.Linq.Lookup<TKey,TElement>
	    //     from.
	    //
	    //   keySelector:
	    //     A function to extract a k from each element.
	    //
	    //   elementSelector:
	    //     A transform function to produce a result element value from each element.
	    //
	    //   comparer:
	    //     An System.Collections.Generic.IEqualityComparer<T> to compare keys.
	    //
	    // Returns:
	    //     A System.Linq.Lookup<TKey,TElement> that contains values of type TElement
	    //     selected from the input sequence.*/
	    //http://msdn.microsoft.com/en-us/library/bb549211.aspx
	    toLookup: function (keySelector, elementSelector, comparer) {
	        return this.groupBy(
									keySelector || function (v, k) { return String(v).toUpperCase().substring(0, 1); },
									elementSelector,
									resultSelector,
									comparer || function () { return true; }
							   );
	    },

	    /*// union:
	    //     Produces the set union of two sequences by using a specified System.Collections.Generic.IEqualityComparer<T>.
	    //
	    // Parameters:
	    //   first:
	    //     An System.Collections.Generic.IEnumerable<T> whose distinct elements form
	    //     the first set for the union.
	    //
	    //   second:
	    //     An System.Collections.Generic.IEnumerable<T> whose distinct elements form
	    //     the second set for the union.
	    //
	    //   comparer:
	    //     The System.Collections.Generic.IEqualityComparer<T> to compare values.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains the elements from
	    //     both input sequences, excluding duplicates.*/
	    //http://msdn.microsoft.com/en-us/library/bb358407.aspx
	    union: function (second, comparer) {
	        comparer = comparer || function (a, index, b, index2) { return !this.isEqual(a, b); };

	        var result = [], hash = {}, second = second.$ || second;

	        for (var k = 0; k < this.$.length; k++) {
	            for (var k1 = 0; k1 < second.length; k1++) {
	                if (!hash[this.$[k]] && comparer.call(this, this.$[k], k, second[k1], k1, hash)) {
	                    hash[this.$[k]] = true;
	                    result.push(this.$[k]);
	                }
	            }
	        }

	        delete hash;
	        hash = null;

	        return Q(result);
	    },

	    /* where:
	    //     Filters a sequence of values based on a predicate. Each element's index is
	    //     used in the logic of the predicate function.
	    //
	    // Parameters:
	    //   predicate:
	    //     A function to test each source element for a condition; the second parameter
	    //     of the function represents the index of the source element.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains elements from
	    //     the input sequence that satisfy the condition.*/
	    where: function (predicate) {

	        if (!predicate)
	            return this;

	        var result = [];
	        // The predicate was passed in as a Method that return a Boolean
	        for (var k = 0; k < this.$.length; k++) {
	            if (predicate.call(this, this.$[k], k) !== false) {
	                result.push(this.$[k]);
	            }
	        }
	        return Q(result);
	    },

	    /* zip:
	    //     Merges two sequences by using the specified predicate function.
	    //
	    // Parameters:
	    //   second:
	    //     The second sequence to merge.
	    //
	    //   resultSelector:
	    //     A function that specifies how to merge the elements from the two sequences.
	    //
	    // Returns:
	    //     An System.Collections.Generic.IEnumerable<T> that contains merged elements
	    //     of two input sequences. */
	    zip: function (second, resultSelector) {
	        var result = [];
	        for (var k = 0; k < this.$.length; k++) {
	            if (k < second.length)
	                break;

	            result.push(resultSelector.call(this, this.$[k], second[k]));
	        }

	        return Q(result);
	    },

	    indexOf: function (predicate) {
	        if (!predicate)
	            return -1;

	        var result = -1;
	        for (var k = 0; k < this.$.length; k++) {
	            if (predicate.call(this, this.$[k], k) !== false)
	                return k
	        }
	        return -1;
	    },

	    sort: function (comparer, direction) {
	        if (!direction)
	            direction = 1;
	        var result = this.clone(false);
	        return Q(
				result.sort(function (a, b) {
				    var v1 = comparer ? comparer(a) : a;
				    var v2 = comparer ? comparer(b) : b;
				    return ((v1 < v2) ? -1 : 1) * direction;
				})
			);
	    },

	    clone: function (deepCopy) {
	        if (deepCopy) {

	            var _cloneArray, _cloneObject, _clone;
	            _cloneArray = function (data) {
	                var newArray = [];
	                for (var idx = 0; idx < data.length; idx++) {
	                    newArray[idx] = _clone(data[idx]);
	                }
	                return newArray;
	            }

	            _cloneObject = function (data) {
	                var newobj = {};
	                for (var k_ in data) {
	                    newobj[k_] = _clone(data[k_]);
	                }
	                return newobj;
	            }

	            _clone = function (data) {
	                if (!data)
	                    return;

	                var NewData = Q.t.isArray(data) ? [] : {};
	                if (Q.t.isArray(data))
	                    NewData = _cloneArray(data);
	                else if (Q.t.isObject(data))
	                    NewData = _cloneObject(data);
	                else if (Q.t.isDate(data))
	                    return new Date(data.getYear(), data.getMonth(), data.getDate(), data.getHours(), data.getMinutes(), data.getSeconds(), data.getMilliseconds()); //To Do: Checking
	                else
	                    return data;

	                return NewData;
	            }
	            return _clone(this.$);
	        }
	        else {
	            var result = [];
	            for (var k = 0; k < this.$.length; k++)
	                result.push(this.$[k]);

	            return result;
	        }
	    },

	    isEqual: function (obj1, obj2) {
	        return (obj1 === obj2); //Typed check and To Do: Deep checking
	    }
	};
    Q.fn.init.prototype = Q.fn;
})();
