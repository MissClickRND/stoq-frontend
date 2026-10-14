const dates = Array.from({ length: 14 }, (_, index) => `${index + 1} окт.`);

function chartData(values: number[]) {
  return values.map((value, index) => ({ date: dates[index], value }));
}

export const mockRevenue = chartData([
  28400, 32100, 29800, 38600, 35200, 46700, 51200,
  33400, 37800, 41200, 39500, 48600, 56400, 52300,
]);

export const mockEarning = chartData([
  8200, 9600, 8700, 12400, 10800, 15200, 17600,
  10200, 11800, 13500, 12100, 16400, 19800, 18200,
]);

export const mockOrders = chartData([
  32, 38, 35, 46, 41, 54, 61, 39, 43, 48, 45, 57, 66, 62,
]);
