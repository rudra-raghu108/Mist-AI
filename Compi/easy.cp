#include <bits/stdc++.h>
using namespace std;
const int MOD = 10007;

inline int addm(int a, int b) { a += b; if (a >= MOD) a -= MOD; return a; }

int memo[201][201][106]; // memo[l][r][k] : number of palindromes from substring s[l..r] with exactly k insertions

int dp(string& s, int l, int r, int k) {
    if (k < 0) return 0; // invalid state: cannot insert negative letters
    if (l > r) return 1; // base case: empty string is always a palindrome
    if (l == r) return 1; // base case: single letter is always a palindrome
    if (memo[l][r][k] != -1) return memo[l][r][k]; // retrieve memoized result

    int& ans = memo[l][r][k] = 0;
    if (s[l] == s[r]) {
        // if characters match, consider the substring in between
        ans = dp(s, l + 1, r - 1, k);
    } else {
        // if characters don't match, consider two possibilities:
        // 1. insert a character to match s[l] with s[r]
        // 2. insert a character to match the next characters in the substring
        ans = addm(dp(s, l + 1, r, k - 1), dp(s, l, r - 1, k - 1));
    }
    return ans;
}

int countPalindromes(string& s, int k) {
    int m = s.length();
    int total = 0;

    // fill memoization table
    memset(memo, -1, sizeof(memo));
    
    // count palindromes with at most k insertions
    for (int i = 0; i <= k; ++i) {
        total = addm(total, dp(s, 0, m - 1, i));
    }

    return total;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string s;
    int k;
    cin >> s >> k;

    cout << countPalindromes(s, k) << "\n";
    return 0;
}
