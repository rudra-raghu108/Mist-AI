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
    
    print(f"Processing string: '{s}', length: {n}, k: {k}")
    
    # Use a simpler approach: count palindromes with exactly k insertions
    # and sum them up for all k from 0 to k
    memo = {}
    call_count = 0
    
    def dp(l, r, k_val):
        nonlocal call_count
        call_count += 1
        if call_count % 10000 == 0:
            print(f"DP calls: {call_count}, l={l}, r={r}, k={k_val}")
        
        if k_val < 0:
            return 0
        if l >= r:
            return 1
        
        key = (l, r, k_val)
        if key in memo:
            return memo[key]
        
        if s[l] == s[r]:
            result = dp(l + 1, r - 1, k_val)
        else:
            result = addm(dp(l + 1, r, k_val - 1), dp(l, r - 1, k_val - 1))
        
        memo[key] = result
        return result
    
    total = 0
    for i in range(k + 1):
        print(f"Computing for k={i}")
        result = dp(0, n - 1, i)
        total = addm(total, result)
        print(f"Result for k={i}: {result}, total so far: {total}")
    
    print(f"Total DP calls: {call_count}")
    return total

def main():
    """Main function to read input and output result"""
    # Test with a simple case first
    s = "abc"
    k = 2
    
    print(f"Testing with s='{s}', k={k}")
    result = count_palindromes(s, k)
    print(f"Final result: {result}")

if __name__ == "__main__":
    main()

