---
layout: post
uri: 2022-06-20-peak-finding
title: "Peak Finding"
tags:
 - Algorithm
---

## Definition
Given an array of items. Find **A** peak element in it.
An element is a peak element when it is greater than or equal to its neighbour elements.

`arr` is an array with length `n`

`arr[i+1]` is an peak element iff: `arr[i+1] >= arr[i]` and `arr[i+1] >= arr[i+2]`

`arr[0]` is an peak element iff: `arr[0] >= arr[1]`
`arr[n-1]` is an peak element iff: `arr[n-1] >= arr[n-2]`

```javascript
// element 8 is a peak element
// Since it's greater than or euqal to every neighbour elements
const arr = [ 1, 3, 5, 8, 1 ];
```

## Find a peak in 1D array

### Loop-through
We can simply loop through every element, and check if it is a peak element.

+ Worst Case
```javascript
const arr = [1, 2, 3, 4, 5, 6];
```
In this case, we will have ![theta of n](http://mathurl.com/render.cgi?\theta%28n%29) as time complexity

### Divide and Conquer
0. if arr has a length of 1, arr[0] is a peak, and we are down.
1. We start at `n/2` position.
2. if `arr[n/2]` is less than `arr[n/2-1]`, continue with `arr[0 : n/2-1]`
3. if `arr[n/2]` is less than `arr[n/2+1]`, continue with `arr[n/2+1 : n-1]`
3. else `arr[n/2]` is a peak, and we are down.


#### Time complexity

![theta of n](http://mathurl.com/render.cgi?T%28n%29%20%3D%20T%28n/2%29%20+%20%5Ctheta%281%29%20%5C%5C%0AT%28n/2%29%20%3D%20T%28n/4%29%20+%20%5Ctheta%281%29%20%5C%5C%0AT%281%29%20%3D%20%5Ctheta%281%29%20%5C%5C%0A2%5Em%20%3D%20n%2C%20%5Clog_2%20n%20%3D%20m%20%5C%5C%0AT%28n%29%20%3D%20%5Ctheta%28%5Clog_2%20n%29%0A%5Cnocache)

## Find a peak in 2D array
### Divide and Conquer
0. If the array have only one column, same as 1D array peak.
1. we pick the middle column `m/2`, find the global max of the column at (m/2, i)
2. if (m/2, i) < (m/2 - 1, i), find the 2D peak in [0, m/2-1]
2. if (m/2, i) < (m/2 + 1, i), find the 2D peak in [m/2+1, m-1]
4. else (m/2, i) is a 2D peak, and we are down.

#### Time Complexity
![complexity](http://mathurl.com/render.cgi?T%28n%2C%20m%29%20%3D%20T%28n%2C%20m/2%29%20+%20%5Ctheta%28n%29%20+%20C%20%5C%5C%0AT%28n%2C%20m/2%29%20%3D%20T%28n%2C%20m/4%29%20+%20%5Ctheta%28n%29%20+%20C%20%5C%5C%0AT%28n%2C%201%29%20%3D%20%5Ctheta%28n%29%20%5C%5C%0AT%28n%2C%20m%29%20%3D%20%5Ctheta%28n%5Clog_2%20m%29%5Cnocache)

## Peak Finding on Leetcode

+ LeetCode #162 Find a Peak Element

```javascript
var findPeakElement = function(nums) {
    let l = 0, r = nums.length - 1;
    
    while(l < r) {
        let m = Math.floor( (l + r) / 2 );
        
        if( nums[m] < nums[m-1] ) {
            r = m-1;
        } else if( nums[m] < nums[m+1] ) {
            l = m+1;
        } else {
            l = m;
            break;
        }
    }
    
    return l;
};
```

## LeetCode #1901 Find a Peak Element II

```javascript
var findPeakGrid = function(mat) {
    let l = 0, r = mat[0].length - 1, maxRow = 0;
    
    while( l <= r ) {
        let m = Math.floor( (l+r) / 2 );
        maxRow = 0;
        
        for(let i = 0; i < mat.length; i++) {
            if( mat[i][m] > mat[maxRow][m] ) {
                maxRow = i;
            }
        }
        
        if( mat[maxRow][m] < mat[maxRow][m-1] ) {
            r = m - 1;
        } else if( mat[maxRow][m] < mat[maxRow][m+1] ) {
            l = m + 1;
        } else {
            l = m;
            break;
        }
    }
    
    return [maxRow, l];
};
```
