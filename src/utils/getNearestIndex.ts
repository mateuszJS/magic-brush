export default function getNearestIndex<
  T extends { [key in K]: number },
  K extends keyof T
>(value: T[K], arr: T[], searchByProp: K): number {
  // uses binary
  // value needs to be always within(inclusive) range of arr
  // if(value < a[0]) {
  //     return a[0];
  // }
  // if(value > a[a.length-1]) {
  //     return a[a.length-1];
  // }

  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((hi + lo) / 2);

    if (value < arr[mid][searchByProp]) {
      hi = mid - 1;
    } else if (value > arr[mid][searchByProp]) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }
  // lo == hi + 1
  return arr[lo][searchByProp] - value < value - arr[hi][searchByProp]
    ? lo
    : hi;
}
