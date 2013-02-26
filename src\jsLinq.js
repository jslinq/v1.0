//-----------------------------------------------------------------------
// Part of the LINQ to JavaScript (JSLINQ) v1.0.0 Project - http://jshibernate.com/JSLINQ/
// Copyright (C) 2013 JsHibernate (http://jshibernate.com). All rights reserved.
// This project is licensed under the Microsoft Reciprocal License (Ms-RL)
// This license can be found here: http://jshibernate.com/JSLINQ/license
// Document refrence http://msdn.microsoft.com/en-us/library/bb341635.aspx
//-----------------------------------------------------------------------

(function() {
    JSLINQ = window.JSLINQ = function(source) 
  {
        return new JSLINQ.fn.init(source);
    };

    JSLINQ.Types = {
        Boolean: typeof true,
        Number: typeof 0,
        String: typeof "",
        Object: typeof {},
		Array : typeof [],
        Undefined: typeof undefined,
        Function: typeof function () { },
		TypeConvertor: function(type, value) {
			switch(type)
			{
				case JSLINQ.Types.Boolean:
					return value ? true : false;
				
				case JSLINQ.Types.Number:
					var fvalue = parseFloat(value);
					return isNan(fvalue) ? 0 : fvalue;
				
				case JSLINQ.Types.String:
					return String(value);
				
				default:
					return value; //Other convertion will be handled in upcomming releases
			}
		}
    }
	
	JSLINQ.from = function(value) {
			if (value == null || typeof value == JSLINQ.Types.Undefined)
				return JSLINQ([]);
			
			if (value instanceof JSLINQ)
				return value;
			
			if (typeof value == JSLINQ.Types.Number || typeof value == JSLINQ.Types.Boolean)
				return JSLINQ.Repeat(value, 1);
			
			if (typeof value == JSLINQ.Types.Array)
				return JSLINQ(value);
				
			if (typeof value == JSLINQ.Types.String)
			{
				var result = [];
				for(var index =0; index < value.length; index++)
					result.push(value.charAt(index));
				return JSLINQ(result);
			}
	};
	
	JSLINQ.Repeat = function(element, count)
	{
		var result = [];
		for (var index = 0; index < count; index++)
			result.push(element);
		
		return JSLINQ(result);
	};
		
	JSLINQ.fn = JSLINQ.prototype = 
	{
        version: '1.0.0',
		
		init: function(source) {
            
			this.source = source;
        },
		
		/* Aggregate:
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
        Aggregate: function(func, accumulator )	{
			var result;
			func = func || function(a, b) { return b ? a + b : a;};
			
			for(var key in this.source)
			{
				result = func.call(this, this.source[key], result);
			}
			
			return accumulator + result;
		},
		
		/* All:
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
        All : function(predicate) {
			if(!this.source.length)
				return false;
				
			if(!predicate)
				return true;
				
			for (var key in this.source) 
			{
                if (predicate.call(this, this.source[key], key) !== true)
					return false; 
			}
			
            return true;
		},
        
        /* Any:
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
        Any: function(predicate) {
			if(!this.source.length)
				return false;
				
			if(!predicate)
				return true;
			
			for (var key in this.source)
			{
                if (predicate.call(this, this.source[key], key) === true)
					return true; 
			}
            return false;
		},
        
        /* Average:
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
        Average : function(selector) {
			var total = 0, count = 0;
			
			if(!selector)
				selector = function(a) { return a; };
			
			for (var key in this.source) 
			{
                total += (selector) ? selector.call(this, this.source[key], key) : this.source[key];
				count++;
			}
            return count > 0 ? total / count : 0;
		},
        
        /* Cast:
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
        Cast: function(type, valueSelector, convertor) {
			var result = [], convertor = convertor || JSLINQ.Types.TypeConvertor;
			
			for(var key in this.source)
			{
				var value = valueSelector ? valueSelector.call(this, this.source[key], key) : this.source[key];
				value = convertor ? convertor.call(this, type, value) : value;
				result.push(value);
			}
			return JSLINQ(result);
		},
        
        /* Concat:
        //     Concatenates two sequences.
        //
        // Parameters:
        //   second:
        //     The sequence to concatenate to the first sequence.
        //
        // Returns:
        //     An System.Collections.Generic.IEnumerable<T> that contains the concatenated
        //     elements of the two input sequences.*/
        Concat: function(second) {
			var first = this.source,
				second = second.source || second;
			
            return new JSLINQ(first.concat(second));
		},
        
		/* Contains:
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
        Contains: function(value, comparer)	{
			
			comparer = comparer || function(a, b) { return this.IsEqual(a, b); }
			
			for(var key in this.source)
			{
				if(comparer.call(this, value, this.source[key]))
					return true;
			}			
			return false;
		},
       
	    /* Count:
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
        Count : function(predicate)	{
			if(!predicate)
				return this.source.length;

			return this.Where(predicate).Count();
		},
        
        /* DefaultIfEmpty:
        //     Returns the elements of the specified sequence or the specified value in
        //     a singleton collection if the sequence is empty.
        //
        // Parameters:
        //   source:
        //     The sequence to return the specified value for if it is empty.
        //
        //   defaultValue:
        //     The value to return if the sequence is empty.
        //
        // Returns:
        //     An System.Collections.Generic.IEnumerable<T> that contains defaultValue if
        //     source is empty; otherwise, source. */
        DefaultIfEmpty: function(defaultValue) {
			if (!this.source || this.source.length == 0) 
			    return defaultValue;
            
			return this;
		},
		
		/* Distinct:
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
        Distinct: function(comparer) {
			//Need to validate 
			if (!this.source || this.source.length == 0) 
			    return JSLINQ([]);
            
			comparer = comparer || function (a) { return a; };
			var result = [], hash = {};
			
			for(var key in this.source)
			{
				var value = comparer.call(this, this.source[key], key);
				if(typeof value != 'undefined' && value != null && !hash[value])
				{
					result.push(this.source[key]);
					hash[value] = true;
				}
			}
			
			return JSLINQ(result);
		},
        
        /* ElementAt:
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
        ElementAt: function(index) {
			if (this.IsEmpty() || index < 0 || index >= this.source.length)
			    return null;
			
			return this.source[index];
		},
        
        /* ElementAtOrDefault:
        //     Returns the element at a specified index in a sequence or a default value
        //     if the index is out of range.
        //
        // Parameters:
        //   source:
        //     An System.Collections.Generic.IEnumerable<T> to return an element from.
        //
        //   index:
        //     The zero-based index of the element to retrieve.
        //
        // Returns:
        //     default(TSource) if the index is outside the bounds of the source sequence;
        //     otherwise, the element at the specified position in the source sequence.*/
        ElementAtOrDefault: function(index)	{
			var result = this.ElementAt(index);
			return result;
		},
        
        /* IsEmpty:
        //     Returns an empty System.Collections.Generic.IEnumerable<T> that has the specified
        //     type argument.
        //
        // Returns:
        //     An empty System.Collections.Generic.IEnumerable<T> whose type argument is
        //     TResult. */
        IsEmpty: function()	{
			return !this.source.length;
		},
		
        /* Except:
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
        Except: function(second, comparer) {
			//Need to validate 
			second = second.source || second;
			
			if (this.IsEmpty()) 
			    return (!second || !second.length) ?  null : JSLINQ(second);
            
			if(!second || !second.length)
				return this;

			var result = [], secondLinQ = second.source ? second : JSLINQ(second);
			
			for(var key in this.source)
			{
				var value = this.source[key];
				var single = secondLinQ.Single( function(a) { return !this.IsEqual(a, value); } );
				if(!comparer(value, single))
				{
					result.push(value);
				}
			}
			
			return JSLINQ(result);
		},
		
        /* First:
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
		First: function(predicate) {
            if (predicate) 
                return this.Where(predicate).First();
            else 
                return (this.source.length > 0) ? this.source[0] : null;
        },
        
        /* FirstOrDefault:
        //     Returns the first element of the sequence that satisfies a condition or a
        //     default value if no such element is found.
        //
        // Parameters:
        //   source:
        //     An System.Collections.Generic.IEnumerable<T> to return an element from.
        //
        //   predicate:
        //     A function to test each element for a condition.
        //
        // Returns:
        //     default(TSource) if source is empty or if no element passes the test specified
        //     by predicate; otherwise, the first element in source that passes the test
        //     specified by predicate.*/
        FirstOrDefault: function(type, predicate) {
			var first = this.First(predicate);
			if(!first)
				first = ''; //To Do: Strongly typed value
			
			return first;
		},
        
        /* GroupBy:
        //     Groups the elements of a sequence according to a specified key selector function
        //     and creates a result value from each group and its key. Key values are compared
        //     by using a specified comparer, and the elements of each group are projected
        //     by using a specified function.
        //
        // Parameters:
        //   source:
        //     An System.Collections.Generic.IEnumerable<T> whose elements to group.
        //
        //   keySelector:
        //     A function to extract the key for each element.
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
        //     projection over a group and its key. */
        GroupBy: function(keySelector, elementSelector, resultSelector, comparer) {
			//Need to validate 
			var result = [];
			comparer = comparer || function(a, b) { return true; };
			for(var key in this.source)
			{
				if(comparer.call(this, this.source[key], key))
				{
					var groupingKey = 	keySelector ? keySelector.call(this, this.source[key], key) : this.source[key];
					result[groupingKey] = result[groupingKey] || [];
				
					var element = elementSelector ? elementSelector.call(this, this.source[key], key) : this.source[key];
				
					result[groupingKey].push(resultSelector ? resultSelector.call(this, element, groupingKey) : element);
				}
			}
			return JSLINQ(result);
		},
        
        /* GroupJoin:
        //     Correlates the elements of two sequences based on key equality and groups
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
        //     A function to extract the join key from each element of the first sequence.
        //
        //   innerKeySelector:
        //     A function to extract the join key from each element of the second sequence.
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
        GroupJoin: function(inner, outerKeySelector, innerKeySelector, resultSelector, comparer) {
			
			//not clear
		},
       
        /* Intersect:
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
        Intersect: function(second, comparer) {
			// Need a validation 
			return this.Union(second, comparer || function(a, index1, b, index2) { return this.IsEqual(a, b); } );
		},
        
        /* Join:
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
        //     A function to extract the join key from each element of the first sequence.
        //
        //   innerKeySelector:
        //     A function to extract the join key from each element of the second sequence.
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
        Join:function(second, outerKeySelector, innerKeySelector, resultSelector, comparer) {
			//Need to validate 
			var result = [], second = second.source || second;
			for(var key in this.source)
			{
				var v1 = outerKeySelector ? outerKeySelector.call(this, this.source[key], key) : this.source[key];
				
				for(var key1 in second)
				{
					var v2 = innerKeySelector ? innerKeySelector.call(this, second[key1], key1) : second[key1];
					var canProceed = comparer ? comparer.call(this, v1, key, v2, key1) : true;
					if(canProceed && this.IsEqual(v1, v2))
					{
						result.push( resultSelector ? resultSelector.call(this, v1, key, v2, key1) : v1);
					}
				}
			}
			
			return JSLINQ(result);
		},
		
        /* Last:
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
        Last: function(predicate) {
			if (predicate) {
                return this.Where(predicate).Last();
            }
            else 
			{
                return (this.source.length > 0) ? this.source[this.source.length - 1] : null;
            }
		},
        
        /* LastOrDefault:
        //     Returns the last element of a sequence that satisfies a condition or a default
        //     value if no such element is found.
        //
        // Parameters:
        //   source:
        //     An System.Collections.Generic.IEnumerable<T> to return an element from.
        //
        //   predicate:
        //     A function to test each element for a condition.
        //
        // Returns:
        //     default(TSource) if the sequence is empty or if no elements pass the test
        //     in the predicate function; otherwise, the last element that passes the test
        //     in the predicate function.*/
		LastOrDefault:function(type, predicate)	{
			return this.Last(predicate);
		},
        
        /* Max:
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
        Max: function(selector, comparer)	{
			
			var result = null, comparer = comparer ||  function(a, b) { return a < b ? b : a; };
			for(var key in this.source)
			{
				var canSelect = predicate ? predicate.call(this, this.source[key], key) : true; 
				if(canSelect)
				{
					var selection = selector ? selector.call(this, this.source[key], key) : this.source[key];
					result = (result == null) ? selection : comparer.call(this, result, selection)
				}
			}
			
			return result;
		},
        
        /* Min:
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
        Min:function(selector) {
			
			var result = null, comparer = comparer ||  function(a, b) { return a > b ? b : a; };
			for(var key in this.source)
			{
				var canSelect = predicate ? predicate.call(this, this.source[key], key) : true; 
				if(canSelect)
				{
					var selection = selector ? selector.call(this, this.source[key], key) : this.source[key];
					result = (result == null) ? selection : comparer.call(this, result, selection)
				}
			}
			
			return result;
		},
        
        /*// OfType:
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
        OfType: function(type, valueSelector) {
			
			var first = this.ElementAt(0);
			return (typeof first === type);
		},
        
		/* OrderBy:
        //     Sorts the elements of a sequence in ascending order by using a specified
        //     comparer.
        //
        // Parameters:
        //   source:
        //     A sequence of values to order.
        //
        //   keySelector:
        //     A function to extract a key from an element.
        //
        //   comparer:
        //     An System.Collections.Generic.IComparer<T> to compare keys.
        //
        // Returns:
        //     An System.Linq.IOrderedEnumerable<TElement> whose elements are sorted according
        //     to a key.*/
        OrderBy:function(comparer)	{

			return this.Sort(comparer);
		},
        
        /* OrderByDescending:
        //     Sorts the elements of a sequence in descending order by using a specified
        //     comparer.
        //
        // Parameters:
        //   source:
        //     A sequence of values to order.
        //
        //   keySelector:
        //     A function to extract a key from an element.
        //
        //   comparer:
        //     An System.Collections.Generic.IComparer<T> to compare keys.
        //
        // Returns:
        //     An System.Linq.IOrderedEnumerable<TElement> whose elements are sorted in
        //     descending order according to a key.*/
        OrderByDescending:function(comparer) {
			//Need to validate 
			return this.Sort(comparer, -1);
		},
        
        /* Range:
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
        Range:function(start, count, selector) {
			
			var result = [];
			if(typeof start != 'Number' || typeof count != 'Number')
				return JSLINQ(result);
			
			for(var key = start; key < count; key++)
			{
				result.push(selector ? selector.call(this, key, start, count) : key);
			}
			
			return JSLINQ(result);
		},

        /* Repeat:
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
        Repeat:function(element, count)
		{
			return JSLINQ.Repeat(element, count);
		},

        /* Reverse:
        //     Inverts the order of the elements in a sequence.
        //
        // Parameters:
        //   source:
        //     A sequence of values to reverse.
        //
        // Returns:
        //     A sequence whose elements correspond to those of the input sequence in reverse
        //     order.*/
        Reverse:function()
		{
			var result = [];
            for (var index = this.source.length - 1; index > -1; index--)
                result.push(this.source[index]);
            
			return JSLINQ(result);
		},
        
        /* Select:
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
        Select: function(predicate, selector)
		{
			//Need to validate 
			var result = [];
			for(var key in this.source)
			{
				var canSelect = predicate ? predicate.call(this, this.source[key], key) : true; 
				if(canSelect)
				{
					var selection = selector ? selector.call(this, this.source[key], key) : this.source[key];
					if(selection != null && typeof selection != 'undefined')
						result.push(selection);
				}
			}
			
			return JSLINQ(result);
		},
       
        /* SelectMany:
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
        SelectMany: function(collectionSelector, resultSelector, predicate)
		{
			//Need to validate 
			var result = [];
			for(var key in this.source)
			{
				var selection = collectionSelector ? collectionSelector.call(this, this.source[key], key) : this.source[key];
				var canSelect = predicate ? predicate.call(this, selection) : true; 
				if(canSelect)
				{
					if(selection != null && typeof selection != 'undefined')
						result.push(resultSelector ? resultSelector.call(this, selection) : selection);
				}
			}
			
			return JSLINQ(result);
		},

        /* SequenceEqual:
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
        SequenceEqual: function(second, comparer)
		{
			//Need to validate 	
			second = second.source || second;
			var one = comparer ? this.Where(comparer) : this.source;
			var two = comparer ? JSLINQ(second).Where(comparer) : second;
			
			if(one.length != two.length)
				return false;
			
			for(var key in one)
			{
				if(this.IsEqual(one[key], two[key]) !== true)
					return false;
			}
			return true;
		},
       
        /* Single:
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
        Single: function(predicate)
		{
			return this.Where(predicate).First();
		},
        
        /* SingleOrDefault:
        //     Returns the only element of a sequence that satisfies a specified condition
        //     or a default value if no such element exists; this method throws an exception
        //     if more than one element satisfies the condition.
        //
        // Parameters:
        //   source:
        //     An System.Collections.Generic.IEnumerable<T> to return a single element from.
        //
        //   predicate:
        //     A function to test an element for a condition.
        //
        // Returns:
        //     The single element of the input sequence that satisfies the condition, or
        //     default(TSource) if no such element is found.*/
        SingleOrDefault: function(predicate)
		{
			return this.Single(predicate);
		},

        /* Skip:
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
        Skip:function(count)
		{
			var result = [];
			if(count > -1 && count < this.source.length)
			{
				for (var index = count; index < this.source.length; index++)
					result.push(this.source[index]);
			}
			return JSLINQ(result);
		},
        
        /* SkipWhile:
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
        SkipWhile: function(predicate)
		{
			return this.Skip(this.IndexOf(predicate));
		}, 
        
        /* Sum:
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
        Sum: function(selector)
		{
			var result = 0;
			
			if(!selector)
				result = this.Aggregate(null, result);

			for(var key in this.source)
				result += (selector.call(this, this.source[key], key) || 0);
			
			return result;
		},

        /* Take:
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
        Take: function(count)
		{
			var result = [];
			for (var key in this.source)
			{
				if(key < count)
					break;
					
				result.push(this.source[key]);
			}
			return JSLINQ(result);
		},
		
        /* TakeWhile:
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
        TakeWhile: function(predicate)
		{
			return this.Take(this.IndexOf(predicate));
		},
       
        /* ThenBy:
        //     Performs a subsequent ordering of the elements in a sequence in ascending
        //     order by using a specified comparer.
        //
        // Parameters:
        //   source:
        //     An System.Linq.IOrderedEnumerable<TElement> that contains elements to sort.
        //
        //   keySelector:
        //     A function to extract a key from each element.
        //
        //   comparer:
        //     An System.Collections.Generic.IComparer<T> to compare keys.
        //
        // Returns:
        //     An System.Linq.IOrderedEnumerable<TElement> whose elements are sorted according
        //     to a key.*/
        ThenBy: function(keySelector, comparer)
		{
			//Not clear
		},
		
        /* ThenByDescending:
        //     Performs a subsequent ordering of the elements in a sequence in descending
        //     order by using a specified comparer.
        //
        // Parameters:
        //   source:
        //     An System.Linq.IOrderedEnumerable<TElement> that contains elements to sort.
        //
        //   keySelector:
        //     A function to extract a key from each element.
        //
        //   comparer:
        //     An System.Collections.Generic.IComparer<T> to compare keys.
        //
        // Returns:
        //     An System.Linq.IOrderedEnumerable<TElement> whose elements are sorted in
        //     descending order according to a key.*/
        ThenByDescending: function(keySelector, comparer)
		{
			//Not clear
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
        ToArray: function()
		{
			return this.source;
		},
		
        /*// ToDictionary:
        //     Creates a System.Collections.Generic.Dictionary<TKey,TValue> from an System.Collections.Generic.IEnumerable<T>
        //     according to a specified key selector function, a comparer, and an element
        //     selector function.
        //
        // Parameters:
        //   keySelector:
        //     A function to extract a key from each element.
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
        ToDictionary: function(keySelector, elementSelector, comparer)
		{
			var result = {};
			
			for(var key in this.source)
			{
				var canDo = comparer ? comparer.call(this, this.source[key], key) : true;
				if(canDo)
				{
					var newkey = keySelector ? keySelector.call(this, this.source[key], key) : key;
					var value = elementSelector ? elementSelector.call(this, this.source[key], key, newkey) : this.source[key];
					
					result[newkey] = value;
				}
			}
			
			return result;
		},

        /*// ToList:
        //     Creates a System.Collections.Generic.List<T> from an System.Collections.Generic.IEnumerable<T>.
        //
        // Parameters:
        //   source:
        //     The System.Collections.Generic.IEnumerable<T> to create a System.Collections.Generic.List<T>
        //     from.
        //
        // Returns:
        //     A System.Collections.Generic.List<T> that contains elements from the input
        //     sequence.*/
        ToList: function()
		{	
			//Not required for JS
			return this.ToArray();
		},
		
        /* ToLookup:
        //     Creates a System.Linq.Lookup<TKey,TElement> from an System.Collections.Generic.IEnumerable<T>
        //     according to a specified key selector function, a comparer and an element
        //     selector function.
        //
        // Parameters:
        //   source:
        //     The System.Collections.Generic.IEnumerable<T> to create a System.Linq.Lookup<TKey,TElement>
        //     from.
        //
        //   keySelector:
        //     A function to extract a key from each element.
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
        ToLookup: function(keySelector, elementSelector, comparer)
		{
			return this.GroupBy(
									keySelector || function(v, k) { return String(v).toUpperCase().substring(0,1); }, 
									elementSelector, 
									resultSelector, 
									comparer || function() { return true; }
							   );
		},
        
        /*// Union:
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
        Union: function(second, comparer)
		{
			comparer = comparer || function(a, index, b, index2) { return !this.IsEqual(a, b); };
         
            var result = [], hash = {}, second = second.source || second;

            for (var key in this.source) 
			{
                for (var key1 in second) 
				{
                    if (!hash[this.source[key]] && comparer.call(this, this.source[key], key, second[key1], key1, hash)) 
					{
						hash[this.source[key]] = true;
						result.push(this.source[key]);
					}
                }
            }
			
			delete hash;
			hash = null;
			
            return JSLINQ(result);
		},
		
        /* Where:
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
		Where: function(predicate) {
            
			if(!predicate)
				return this;
			
			var result = [];			
            // The predicate was passed in as a Method that return a Boolean
            for (var key in this.source) 
			{
                if (predicate.call(this,this.source[key], key) !== false) 
				{
                    result.push(this.source[key]);
                }
            }
            return JSLINQ(result);
        },
        
        /* Zip:
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
        Zip: function(second, resultSelector)
		{
			var result = [];
			for (var key in this.source)
			{
				if(key < second.length)
					break;
					
				result.push(resultSelector.call(this, this.source[key], second[key]));
			}
			
			return JSLINQ(result);
		},

		IndexOf: function(predicate) 
		{
			if(!predicate)
				return -1;
			
			var result = -1;			
            for (var key in this.source) 
			{
                if (predicate.call(this,this.source[key], key) !== false) 
                    return key
            }
            return -1;
        },
		
		Sort: function(comparer, direction)
		{
			if(!direction)
				direction = 1;
			var result = this.Copy(false);
			return JSLINQ(
				result.sort(function(a, b) {
					var v1 = comparer ? comparer(a) : a;
					var v2 = comparer ? comparer(b) : b;
					return ((v1 < v2) ? -1 : 1) * direction;
				})
			);
		},
		
		Copy: function(deepCopy)
		{
			if(deepCopy)
			{
				// var _cloneArray = function (data) {
					// var newArray = [];
					// for (var idx = 0; idx < data.length; idx++) {
						// newArray[idx] = _clone(data[idx]);
					// }
					// return newArray;
				// }

				var _cloneObject = function (data) {
					var newobj = {};
					for (var k_ in data) {
						newobj[k_] = _clone(data[k_]);
					}
					return newobj;
				}
				
				var _clone = function (data) {
					if (!data)
						return;

					var NewData = typeof data == JSLINQ.Types.Array ? [] : {};
					if (typeof data == JSLINQ.Types.Array)
						NewData = _cloneObject(data);
					//else if (instanceof data == Date) 
					//	return new Date(); //To Do: date copy
					else if (typeof data == 'Object') 
						NewData = _cloneObject(data);
					else 
						return data;

					return NewData;
				}
				return _clone(this.source);
			}
			else
			{
				var result = [];
				for(var key in this.source)
					result.push(this.source[key]);

				return result;
			}
		},
		
		IsEqual: function(obj1, obj2)
		{
			return (obj1 === obj2); //Typed check and To Do: Deep checking
		}
	};
    JSLINQ.fn.init.prototype = JSLINQ.fn;
})();
