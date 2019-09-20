it('Array(5).fill(null).forEach((_, i) => {});', () => {
  let result = [];
  Array(5)
    .fill(null)
    .forEach((_, i) => {
      result.push(i);
    });
  console.log(result);
  expect(result).toStrictEqual([0, 1, 2, 3, 4]);
});

it('subarray', () => {
  const array = ['v1', 'v2', 'v3', 'v4', 'v5'];
  const indexes = [2, 3];
  let subarray: string[] = [];
  console.log(...indexes);
  indexes.map(v => {
    subarray.push(array[v]);
  });
  expect(subarray).toStrictEqual(['v3', 'v4']);
});
