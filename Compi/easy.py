MOD = 10007

def addm(a, b):
    """Add two numbers with modulo operation"""
    return (a + b) % MOD

def count_palindromes(s, k):
    """
    Count the number of palindromes that can be formed from string s
    with at most k character insertions using dynamic programming
    """
    n = len(s)
    if n == 0:
        return 1
    
    # Use a simpler approach: count palindromes with exactly k insertions
    # and sum them up for all k from 0 to k
    memo = {}
    
    def dp(l, r, k):
        if k < 0:
            return 0
        if l >= r:
            return 1
        
        key = (l, r, k)
        if key in memo:
            return memo[key]
        
        if s[l] == s[r]:
            result = dp(l + 1, r - 1, k)
        else:
            result = addm(dp(l + 1, r, k - 1), dp(l, r - 1, k - 1))
        
        memo[key] = result
        return result
    
    total = 0
    for i in range(k + 1):
        total = addm(total, dp(0, n - 1, i))
    
    return total

def main():
    """Main function to read input and output result"""
    s = input().strip()
    k = int(input())
    
    result = count_palindromes(s, k)
    print(result)

if __name__ == "__main__":
    main()
