var tape = require("tape"),
    scale = require("../");

require("./inDelta");

tape("pow() has the expected defaults", function(test) {
  var s = scale.pow();
  test.deepEqual(s.domain(), [0, 1]);
  test.deepEqual(s.range(), [0, 1]);
  test.equal(s.clamp(), false);
  test.equal(s.exponent(), 1);
  test.deepEqual(s.interpolate()({array: ["red"]}, {array: ["blue"]})(.5), {array: ["#800080"]});
  test.end();
});

tape("pow(x) maps a domain value x to a range value y", function(test) {
  test.equal(scale.pow().exponent(.5)(.5), Math.SQRT1_2);
  test.end();
});

tape("pow(x) ignores extra range values if the domain is smaller than the range", function(test) {
  test.equal(scale.pow().domain([-10, 0]).range(["red", "white", "green"]).clamp(true)(-5), "#ff8080");
  test.equal(scale.pow().domain([-10, 0]).range(["red", "white", "green"]).clamp(true)(50), "#ffffff");
  test.end();
});

tape("pow(x) ignores extra domain values if the range is smaller than the domain", function(test) {
  test.equal(scale.pow().domain([-10, 0, 100]).range(["red", "white"]).clamp(true)(-5), "#ff8080");
  test.equal(scale.pow().domain([-10, 0, 100]).range(["red", "white"]).clamp(true)(50), "#ffffff");
  test.end();
});

tape("pow(x) maps an empty domain to the range start", function(test) {
  test.equal(scale.pow().domain([0, 0]).range([1, 2])(0), 1);
  test.equal(scale.pow().domain([0, 0]).range([2, 1])(1), 2);
  test.end();
});

tape("pow(x) can map a bipow domain with two values to the corresponding range", function(test) {
  var s = scale.pow().domain([1, 2]);
  test.deepEqual(s.domain(), [1, 2]);
  test.equal(s(0.5), -0.5);
  test.equal(s(1.0),  0.0);
  test.equal(s(1.5),  0.5);
  test.equal(s(2.0),  1.0);
  test.equal(s(2.5),  1.5);
  test.equal(s.invert(-0.5), 0.5);
  test.equal(s.invert( 0.0), 1.0);
  test.equal(s.invert( 0.5), 1.5);
  test.equal(s.invert( 1.0), 2.0);
  test.equal(s.invert( 1.5), 2.5);
  test.end();
});

tape("pow(x) can map a polypow domain with more than two values to the corresponding range", function(test) {
  var s = scale.pow().domain([-10, 0, 100]).range(["red", "white", "green"]);
  test.deepEqual(s.domain(), [-10, 0, 100]);
  test.equal(s(-5), "#ff8080");
  test.equal(s(50), "#80c080");
  test.equal(s(75), "#40a040");
  var s = scale.pow().domain([4, 2, 1]).range([1, 2, 4]);
  test.equal(s(1.5), 3);
  test.equal(s(3), 1.5);
  test.equal(s.invert(1.5), 3);
  test.equal(s.invert(3), 1.5);
  var s = scale.pow().domain([1, 2, 4]).range([4, 2, 1]);
  test.equal(s(1.5), 3);
  test.equal(s(3), 1.5);
  test.equal(s.invert(1.5), 3);
  test.equal(s.invert(3), 1.5);
  test.end();
});

tape("pow.invert(y) maps a range value y to a domain value x", function(test) {
  test.equal(scale.pow().range([1, 2]).invert(1.5), .5);
  test.end();
});

tape("pow.invert(y) maps an empty range to the domain start", function(test) {
  test.equal(scale.pow().domain([1, 2]).range([0, 0]).invert(0), 1);
  test.equal(scale.pow().domain([2, 1]).range([0, 0]).invert(1), 2);
  test.end();
});

tape("pow.invert(y) coerces range values to numbers", function(test) {
  test.equal(scale.pow().range(["0", "2"]).invert("1"), .5);
  test.equal(scale.pow().range([new Date(1990, 0, 1), new Date(1991, 0, 1)]).invert(new Date(1990, 6, 2, 13)), .5);
  test.end();
});

tape("pow.invert(y) returns NaN if the range is not coercible to number", function(test) {
  test.ok(isNaN(scale.pow().range(["#000", "#fff"]).invert("#999")));
  test.ok(isNaN(scale.pow().range([0, "#fff"]).invert("#999")));
  test.end();
});

tape("pow.exponent(exponent) sets the exponent to the specified value", function(test) {
  var x = scale.pow().exponent(.5).domain([1, 2]);
  test.inDelta(x(1), 0, 1e-6);
  test.inDelta(x(1.5), 0.5425821, 1e-6);
  test.inDelta(x(2), 1, 1e-6);
  test.equal(x.exponent(), .5);
  var x = scale.pow().exponent(2).domain([1, 2]);
  test.inDelta(x(1), 0, 1e-6);
  test.inDelta(x(1.5), .41666667, 1e-6);
  test.inDelta(x(2), 1, 1e-6);
  test.equal(x.exponent(), 2);
  var x = scale.pow().exponent(-1).domain([1, 2]);
  test.inDelta(x(1), 0, 1e-6);
  test.inDelta(x(1.5), .6666667, 1e-6);
  test.inDelta(x(2), 1, 1e-6);
  test.equal(x.exponent(), -1);
  test.end();
});

tape("pow.exponent(exponent) changing the exponent does not change the domain or range", function(test) {
  var x = scale.pow().domain([1, 2]).range([3, 4]);
  x.exponent(.5);
  test.deepEqual(x.domain(), [1, 2]);
  test.deepEqual(x.range(), [3, 4]);
  x.exponent(2);
  test.deepEqual(x.domain(), [1, 2]);
  test.deepEqual(x.range(), [3, 4]);
  x.exponent(-1);
  test.deepEqual(x.domain(), [1, 2]);
  test.deepEqual(x.range(), [3, 4]);
  test.end();
});

tape("pow.domain(domain) accepts an array of numbers", function(test) {
  test.deepEqual(scale.pow().domain([]).domain(), []);
  test.deepEqual(scale.pow().domain([1, 0]).domain(), [1, 0]);
  test.deepEqual(scale.pow().domain([1, 2, 3]).domain(), [1, 2, 3]);
  test.end();
});

tape("pow.domain(domain) coerces domain values to numbers", function(test) {
  test.deepEqual(scale.pow().domain([new Date(1990, 0, 1), new Date(1991, 0, 1)]).domain(), [631180800000, 662716800000]);
  test.deepEqual(scale.pow().domain(["0.0", "1.0"]).domain(), [0, 1]);
  test.deepEqual(scale.pow().domain([new Number(0), new Number(1)]).domain(), [0, 1]);
  test.end();
});

tape("pow.domain(domain) makes a copy of domain values", function(test) {
  var d = [1, 2], s = scale.pow().domain(d);
  test.deepEqual(s.domain(), [1, 2]);
  d.push(3);
  test.deepEqual(s.domain(), [1, 2]);
  test.deepEqual(d, [1, 2, 3]);
  test.end();
});

tape("pow.domain() returns a copy of domain values", function(test) {
  var s = scale.pow(), d = s.domain();
  test.deepEqual(d, [0, 1]);
  d.push(3);
  test.deepEqual(s.domain(), [0, 1]);
  test.end();
});

tape("pow.range(range) does not coerce range to numbers", function(test) {
  var s = scale.pow().range(["0px", "2px"]);
  test.deepEqual(s.range(), ["0px", "2px"]);
  test.equal(s(.5), "1px");
  test.end();
});

tape("pow.range(range) can accept range values as colors", function(test) {
  test.equal(scale.pow().range(["red", "blue"])(.5), "#800080");
  test.equal(scale.pow().range(["#ff0000", "#0000ff"])(.5), "#800080");
  test.equal(scale.pow().range(["#f00", "#00f"])(.5), "#800080");
  test.equal(scale.pow().range(["rgb(255,0,0)", "hsl(240,100%,50%)"])(.5), "#800080");
  test.equal(scale.pow().range(["rgb(100%,0%,0%)", "hsl(240,100%,50%)"])(.5), "#800080");
  test.equal(scale.pow().range(["hsl(0,100%,50%)", "hsl(240,100%,50%)"])(.5), "#800080");
  test.end();
});

tape("pow.range(range) can accept range values as arrays or objects", function(test) {
  test.deepEqual(scale.pow().range([{color: "red"}, {color: "blue"}])(.5), {color: "#800080"});
  test.deepEqual(scale.pow().range([["red"], ["blue"]])(.5), ["#800080"]);
  test.end();
});

tape("pow.range(range) makes a copy of range values", function(test) {
  var r = [1, 2], s = scale.pow().range(r);
  test.deepEqual(s.range(), [1, 2]);
  r.push(3);
  test.deepEqual(s.range(), [1, 2]);
  test.deepEqual(r, [1, 2, 3]);
  test.end();
});

tape("pow.range() returns a copy of range values", function(test) {
  var s = scale.pow(), r = s.range();
  test.deepEqual(r, [0, 1]);
  r.push(3);
  test.deepEqual(s.range(), [0, 1]);
  test.end();
});

tape("pow.rangeRound(range) is an alias for pow.range(range).interpolate(interpolateRound)", function(test) {
  test.equal(scale.pow().rangeRound([0, 10])(.59), 6);
  test.end();
});

tape("pow.clamp() is false by default", function(test) {
  test.equal(scale.pow().clamp(), false);
  test.equal(scale.pow().range([10, 20])(2), 30);
  test.equal(scale.pow().range([10, 20])(-1), 0);
  test.equal(scale.pow().range([10, 20]).invert(30), 2);
  test.equal(scale.pow().range([10, 20]).invert(0), -1);
  test.end();
});

tape("pow.clamp(true) restricts output values to the range", function(test) {
  test.equal(scale.pow().clamp(true).range([10, 20])(2), 20);
  test.equal(scale.pow().clamp(true).range([10, 20])(-1), 10);
  test.end();
});

tape("pow.clamp(true) restricts input values to the domain", function(test) {
  test.equal(scale.pow().clamp(true).range([10, 20]).invert(30), 1);
  test.equal(scale.pow().clamp(true).range([10, 20]).invert(0), 0);
  test.end();
});

tape("pow.clamp(clamp) coerces the specified clamp value to a boolean", function(test) {
  test.equal(scale.pow().clamp("true").clamp(), true);
  test.equal(scale.pow().clamp(1).clamp(), true);
  test.equal(scale.pow().clamp("").clamp(), false);
  test.equal(scale.pow().clamp(0).clamp(), false);
  test.end();
});

tape("pow.interpolate(interpolate) takes a custom interpolator factory", function(test) {
  function interpolate(a, b) { return function(t) { return [a, b, t]; }; }
  var s = scale.pow().domain([10, 20]).range(["a", "b"]).interpolate(interpolate);
  test.equal(s.interpolate(), interpolate);
  test.deepEqual(s(15), ["a", "b", .5]);
  test.end();
});

tape("pow.nice() is an alias for pow.nice(10)", function(test) {
  test.deepEqual(scale.pow().domain([0, .96]).nice().domain(), [0, 1]);
  test.deepEqual(scale.pow().domain([0, 96]).nice().domain(), [0, 100]);
  test.end();
});

tape("pow.nice(count) extends the domain to match the desired ticks", function(test) {
  test.deepEqual(scale.pow().domain([0, .96]).nice(10).domain(), [0, 1]);
  test.deepEqual(scale.pow().domain([0, 96]).nice(10).domain(), [0, 100]);
  test.deepEqual(scale.pow().domain([.96, 0]).nice(10).domain(), [1, 0]);
  test.deepEqual(scale.pow().domain([96, 0]).nice(10).domain(), [100, 0]);
  test.deepEqual(scale.pow().domain([0, -.96]).nice(10).domain(), [0, -1]);
  test.deepEqual(scale.pow().domain([0, -96]).nice(10).domain(), [0, -100]);
  test.deepEqual(scale.pow().domain([-.96, 0]).nice(10).domain(), [-1, 0]);
  test.deepEqual(scale.pow().domain([-96, 0]).nice(10).domain(), [-100, 0]);
  test.end();
});

tape("pow.nice(count) nices the domain, extending it to round numbers", function(test) {
  test.deepEqual(scale.pow().domain([1.1, 10.9]).nice(10).domain(), [1, 11]);
  test.deepEqual(scale.pow().domain([10.9, 1.1]).nice(10).domain(), [11, 1]);
  test.deepEqual(scale.pow().domain([.7, 11.001]).nice(10).domain(), [0, 12]);
  test.deepEqual(scale.pow().domain([123.1, 6.7]).nice(10).domain(), [130, 0]);
  test.deepEqual(scale.pow().domain([0, .49]).nice(10).domain(), [0, .5]);
  test.end();
});

tape("pow.nice(count) has no effect on degenerate domains", function(test) {
  test.deepEqual(scale.pow().domain([0, 0]).nice(10).domain(), [0, 0]);
  test.deepEqual(scale.pow().domain([.5, .5]).nice(10).domain(), [.5, .5]);
  test.end();
});

tape("pow.nice(count) nicing a polypow domain only affects the extent", function(test) {
  test.deepEqual(scale.pow().domain([1.1, 1, 2, 3, 10.9]).nice(10).domain(), [1, 1, 2, 3, 11]);
  test.deepEqual(scale.pow().domain([123.1, 1, 2, 3, -.9]).nice(10).domain(), [130, 1, 2, 3, -10]);
  test.end();
});

tape("pow.nice(count) accepts a tick count to control nicing step", function(test) {
  test.deepEqual(scale.pow().domain([12, 87]).nice(5).domain(), [0, 100]);
  test.deepEqual(scale.pow().domain([12, 87]).nice(10).domain(), [10, 90]);
  test.deepEqual(scale.pow().domain([12, 87]).nice(100).domain(), [12, 87]);
  test.end();
});

tape("pow.ticks(count) returns the expected ticks for an ascending domain", function(test) {
  var s = scale.pow();
  test.deepEqual(s.ticks(10), [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(9),  [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(8),  [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(7),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(6),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(5),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(4),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(3),  [0.0,                     0.5,                     1.0]);
  test.deepEqual(s.ticks(2),  [0.0,                     0.5,                     1.0]);
  test.deepEqual(s.ticks(1),  [0.0,                                              1.0]);
  s.domain([-100, 100]);
  test.deepEqual(s.ticks(10), [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(9),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(8),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(7),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(6),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(5),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(4),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(3),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(2),  [-100,                          0,                     100]);
  test.deepEqual(s.ticks(1),  [                               0                         ]);
  test.end();
});

tape("pow.ticks(count) returns the expected ticks for a descending domain", function(test) {
  var s = scale.pow().domain([1, 0]);
  test.deepEqual(s.ticks(10), [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(9),  [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(8),  [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(7),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(6),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(5),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(4),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(3),  [0.0,                     0.5,                     1.0]);
  test.deepEqual(s.ticks(2),  [0.0,                     0.5,                     1.0]);
  test.deepEqual(s.ticks(1),  [0.0,                                              1.0]);
  s.domain([100, -100]);
  test.deepEqual(s.ticks(10), [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(9),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(8),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(7),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(6),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(5),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(4),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(3),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(2),  [-100,                          0,                     100]);
  test.deepEqual(s.ticks(1),  [                               0                         ]);
  test.end();
});

tape("pow.ticks(count) returns the expected ticks for a polypow domain", function(test) {
  var s = scale.pow().domain([0, 0.25, 0.9, 1]);
  test.deepEqual(s.ticks(10), [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(9),  [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(8),  [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  test.deepEqual(s.ticks(7),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(6),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(5),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(4),  [0.0,      0.2,      0.4,      0.6,      0.8,      1.0]);
  test.deepEqual(s.ticks(3),  [0.0,                     0.5,                     1.0]);
  test.deepEqual(s.ticks(2),  [0.0,                     0.5,                     1.0]);
  test.deepEqual(s.ticks(1),  [0.0,                                              1.0]);
  s.domain([100, 0, -100]);
  test.deepEqual(s.ticks(10), [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(9),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(8),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(7),  [-100, -80, -60,      -40, -20, 0, 20, 40,     60, 80, 100]);
  test.deepEqual(s.ticks(6),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(5),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(4),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(3),  [-100,           -50,           0,         50,         100]);
  test.deepEqual(s.ticks(2),  [-100,                          0,                     100]);
  test.deepEqual(s.ticks(1),  [                               0                         ]);
  test.end();
});

tape("pow.ticks(count) returns the empty array if count is not a positive integer", function(test) {
  var s = scale.pow();
  test.deepEqual(s.ticks(NaN), []);
  test.deepEqual(s.ticks(0), []);
  test.deepEqual(s.ticks(-1), []);
  test.deepEqual(s.ticks(Infinity), []);
  test.end();
});

tape("pow.ticks() is an alias for pow.ticks(10)", function(test) {
  var s = scale.pow();
  test.deepEqual(s.ticks(), s.ticks(10));
  test.end();
});

tape("pow.tickFormat() is an alias for pow.tickFormat(10)", function(test) {
  test.equal(scale.pow().tickFormat()(0.2), "0.2");
  test.equal(scale.pow().domain([-100, 100]).tickFormat()(-20), "-20");
  test.end();
});

tape("pow.tickFormat(count) returns a format suitable for the ticks", function(test) {
  test.equal(scale.pow().tickFormat(10)(0.2), "0.2");
  test.equal(scale.pow().tickFormat(20)(0.2), "0.20");
  test.equal(scale.pow().domain([-100, 100]).tickFormat(10)(-20), "-20");
  test.end();
});

tape("pow.tickFormat(count, specifier) sets the appropriate fixed precision if not specified", function(test) {
  test.equal(scale.pow().tickFormat(10, "+f")(0.2), "+0.2");
  test.equal(scale.pow().tickFormat(20, "+f")(0.2), "+0.20");
  test.equal(scale.pow().tickFormat(10, "+%")(0.2), "+20%");
  test.equal(scale.pow().domain([0.19, 0.21]).tickFormat(10, "+%")(0.2), "+20.0%");
  test.end();
});

tape("pow.tickFormat(count, specifier) sets the appropriate round precision if not specified", function(test) {
  test.equal(scale.pow().domain([0, 9]).tickFormat(10, "")(2.10), "2");
  test.equal(scale.pow().domain([0, 9]).tickFormat(100, "")(2.01), "2");
  test.equal(scale.pow().domain([0, 9]).tickFormat(100, "")(2.11), "2.1");
  test.equal(scale.pow().domain([0, 9]).tickFormat(10, "e")(2.10), "2e+0");
  test.equal(scale.pow().domain([0, 9]).tickFormat(100, "e")(2.01), "2.0e+0");
  test.equal(scale.pow().domain([0, 9]).tickFormat(100, "e")(2.11), "2.1e+0");
  test.equal(scale.pow().domain([0, 9]).tickFormat(10, "g")(2.10), "2");
  test.equal(scale.pow().domain([0, 9]).tickFormat(100, "g")(2.01), "2.0");
  test.equal(scale.pow().domain([0, 9]).tickFormat(100, "g")(2.11), "2.1");
  test.equal(scale.pow().domain([0, 9]).tickFormat(10, "r")(2.10e6), "2000000");
  test.equal(scale.pow().domain([0, 9]).tickFormat(100, "r")(2.01e6), "2000000");
  test.equal(scale.pow().domain([0, 9]).tickFormat(100, "r")(2.11e6), "2100000");
  test.equal(scale.pow().domain([0, .9]).tickFormat(10, "p")(.210), "20%");
  test.equal(scale.pow().domain([.19, .21]).tickFormat(10, "p")(.201), "20.1%");
  test.end();
});

tape("pow.tickFormat(count, specifier) sets the appropriate prefix precision if not specified", function(test) {
  test.equal(scale.pow().domain([0, 1e6]).tickFormat(10, "$s")(0.51e6), "$0.5M");
  test.equal(scale.pow().domain([0, 1e6]).tickFormat(100, "$s")(0.501e6), "$0.50M");
  test.end();
});

tape("pow.copy() returns a copy with changes to the domain are isolated", function(test) {
  var x = scale.pow(), y = x.copy();
  x.domain([1, 2]);
  test.deepEqual(y.domain(), [0, 1]);
  test.equal(x(1), 0);
  test.equal(y(1), 1);
  y.domain([2, 3]);
  test.equal(x(2), 1);
  test.equal(y(2), 0);
  test.deepEqual(x.domain(), [1, 2]);
  test.deepEqual(y.domain(), [2, 3]);
  y = x.domain([1, 1.9]).copy();
  x.nice(5);
  test.deepEqual(x.domain(), [1, 2]);
  test.deepEqual(y.domain(), [1, 1.9]);
  test.end();
});

tape("pow.copy() returns a copy with changes to the range are isolated", function(test) {
  var x = scale.pow(), y = x.copy();
  x.range([1, 2]);
  test.equal(x.invert(1), 0);
  test.equal(y.invert(1), 1);
  test.deepEqual(y.range(), [0, 1]);
  y.range([2, 3]);
  test.equal(x.invert(2), 1);
  test.equal(y.invert(2), 0);
  test.deepEqual(x.range(), [1, 2]);
  test.deepEqual(y.range(), [2, 3]);
  test.end();
});

tape("pow.copy() returns a copy with changes to the interpolator are isolated", function(test) {
  var x = scale.pow().range(["red", "blue"]),
      y = x.copy(),
      i0 = x.interpolate(),
      i1 = function(a, b) { return function(t) { return b; }; };
  x.interpolate(i1);
  test.equal(y.interpolate(), i0);
  test.equal(x(0.5), "blue");
  test.equal(y(0.5), "#800080");
  test.end();
});

tape("pow.copy() returns a copy with changes to clamping are isolated", function(test) {
  var x = scale.pow().clamp(true), y = x.copy();
  x.clamp(false);
  test.equal(x(2), 2);
  test.equal(y(2), 1);
  test.equal(y.clamp(), true);
  y.clamp(false);
  test.equal(x(2), 2);
  test.equal(y(2), 2);
  test.equal(x.clamp(), false);
  test.end();
});

tape("sqrt() is an alias for pow().exponent(0.5)", function(test) {
  var s = scale.sqrt();
  test.equal(s.exponent(), 0.5);
  test.inDelta(s(0.5), Math.SQRT1_2, 1e-6);
  test.inDelta(s.invert(Math.SQRT1_2), 0.5, 1e-6);
  test.end();
});
