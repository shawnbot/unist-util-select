'use strict';

var select = require('..'),
    ast = require('./ast'),
    path = require('./lib/path');

var test = require('tape');


test('edge cases', function (t) {
  t.deepEqual(select(ast, ''), []);
  t.deepEqual(select(ast, '\t '), []);
  t.end();
});


test('type selector', function (t) {
  t.equal(select(ast, 'root').length, 1);
  t.equal(select(ast, 'root')[0], ast);
  t.equal(select(ast, 'text').length, 39);
  t.equal(select(ast, 'text')[1], ast.children[1].children[0]);
  t.equal(select(ast, 'tableRow').length, 2);
  t.equal(select(ast, 'heading').length, 5);

  t.deepEqual(select(ast, 'list'), [
    path(ast, [4]),
    path(ast, [4, 1, 1]),
    path(ast, [4, 1, 1, 0, 1]),
    path(ast, [6])
  ]);

  t.end();
});


test('nesting', function (t) {
  t.deepEqual(select(ast, 'root heading'), select(ast, 'heading'));
  t.deepEqual(select(ast, 'paragraph emphasis'), [
    path(ast, [2, 0, 1]),
    path(ast, [3, 1]),
    path(ast, [4, 1, 1, 1, 0, 0, 1])
  ]);
  t.deepEqual(select(ast, 'paragraph > emphasis'), [
    path(ast, [2, 0, 1]),
    path(ast, [3, 1])
  ]);
  t.deepEqual(select(ast, 'paragraph emphasis > text'), [
    path(ast, [2, 0, 1, 0]),
    path(ast, [3, 1, 0]),
    path(ast, [4, 1, 1, 1, 0, 0, 1, 0])
  ]);
  t.deepEqual(select(ast, 'paragraph > emphasis text'), [
    path(ast, [2, 0, 1, 0]),
    path(ast, [3, 1, 0]),
    path(ast, [3, 1, 1, 0])
  ]);
  t.end();
});


test('siblings', function (t) {
  t.deepEqual(select(ast, 'root ~ heading'), []);
  t.deepEqual(select(ast, 'heading ~ heading'), [
    path(ast, [1]),
    path(ast, [7]),
    path(ast, [12]),
    path(ast, [16])
  ]);
  t.deepEqual(select(ast, 'heading + heading'), [
    path(ast, [1])
  ]);
  t.end();
});


test('grouping', function (t) {
  t.deepEqual(select(ast, 'list, heading + heading'), [
    path(ast, [4]),
    path(ast, [4, 1, 1]),
    path(ast, [4, 1, 1, 0, 1]),
    path(ast, [6]),
    path(ast, [1])
  ]);
  t.end();
});


test('universal selector', function (t) {
  t.equal(select(ast, '*').length, totalNodes(ast));
  t.deepEqual(select(ast, '* ~ heading'), select(ast, 'heading ~ heading'));
  t.true(select(ast, 'list > *').every(function (listItem) {
    return listItem.type == 'listItem';
  }));
  t.end();

  function totalNodes (ast) {
    return 1 + (ast.children || []).map(totalNodes).reduce(function (a, b) {
      return a + b;
    }, 0);
  }
});
