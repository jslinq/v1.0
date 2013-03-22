v1.0 (Beta)
==========

LINQ to JavaScript (JSLINQ) is an implementation of LINQ on JSON.

It is a initial verson of jslinq and we welcome your feedbacks / bugs to murugesh_gm@yahoo.com.

Initialize LINQ
===============
In order to make use of LINQ, first we should cast raw object or JSON to a queryable object collection. Let’s us see different types of  initializer with an examples.

Example 1
=========
//Beginners example for understanding of JSLINQ, will start from here (Skip Example #1, those who are expert in JavaScript).

// string to LINQ

    var  stringQ = Q(“jshibernate”); // [‘j’,’s’,’h’,’I’,’b’,’e’,’r’,’n’,’a’,’t’,’e’];

//JSON objects to LINQ

    var  objectQ = Q({“attribute”:”value”});  // [{“attribute”:”value”}); }]

//JSON Array to LINQ

    var  arrayQ = Q([0,1,2,3,4,5,6,7,8,9,0]); // [0,1,2,3,4,5,6,7,8,9,0]);

Guys! now we are ready to play with JSLINQ.
Note: Easy of understanding I have kept the LINQ variables names with type of data it has.


API Usage
=========
Example 2
=========
I wanted to know the vowels in the string ‘jshibernate’. The classic way of doing is first I will iterate the each char in the string then will check and display.
But those who are lazy to write loops and interested to call API get job done! Like me I used to Google to find out is there any open source libraries are there to finish my job if not then my life become miserable 

Ok, let’s us the example instead deviating the topic.

    stringQ.select(
                function(v) { return (v == ‘a’  || v == ‘e’ || v == ‘i’ || v == ‘o’ || v == ‘u’); }, //predicate just return true to pass or false to fail
                function(v) { return v } //selector
    ) ;

Above example #2, select method take two args called predicator and selector.  Predicator decides what to be considered and skipped and selector selects the value.

Here predicator seems very boring right! Let me rewrite same in different way
    
    var  vowelsQ = Q([‘a’,’e’,’i’,’o’,’u’]);

    stringQ.select(
                function(v) { return vowelsQ.contains (v); }, //predicate just return true to pass or false to fail
                function(v) { return v } //selector
    ) ;
    
//Result will be
    
     {$:[ 
        'i',
        'e',
        'a',
        'e'
    ]};
Example 3:
==========

    stringQ.groupBy(
              function(v) { 
                              //a key selector. Just return grouping key
                              return vowelsQ.contains (v) ? ‘I am vowels’: ‘I am not vowels’;
                          } 
                );
    
//result will be

    {$:[ 
      ‘I am vowels’: [‘i’,’e’,’a’,’e’],
      ‘I am not vowels’: [‘j’,’s’,’h’,’b’,’m’,’t’]
    ]};


