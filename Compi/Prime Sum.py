import sys
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    small_primes = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29)
    for p in small_primes:
        if n == p:
            return True
        if n % p == 0:
            return n == p
    d = n - 1
    s = 0
    while d & 1 == 0:
        d >>= 1
        s += 1
    for a in (2, 3, 5, 7, 11, 13, 17):
        if a % n == 0:
            continue
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(s - 1):
            x = (x * x) % n
            if x == n - 1:
                break
        else:
            return False
    return True
def feasible_two(n: int) -> bool:
    if n < 4:
        return False
    if n % 2 == 0:
        return True
    return is_prime(n - 2)
def solve():
    data = list(map(int, sys.stdin.buffer.read().split()))
    it = iter(data)
    t = next(it)
    out_lines = []
    for _ in range(t):
        n = next(it); l = next(it); r = next(it)
        x_min3 = max(l, 3)
        x_max3 = min(r, n // 2)
        has_3plus = x_min3 <= x_max3
        has_2 = (l <= 2 <= r) and feasible_two(n)
        if not has_3plus and not has_2:
            out_lines.append("-1")
            continue
        if (l <= 2 <= r) and feasible_two(n):
            mn = 2
        elif has_3plus:
            mn = x_min3
        else:
            out_lines.append("-1")
            continue
        if has_3plus:
            mx = x_max3
        elif (l <= 2 <= r) and feasible_two(n):
            mx = 2
        else:
            out_lines.append("-1")
            continue
        out_lines.append(f"{mn} {mx}")
    sys.stdout.write("\n".join(out_lines))
if __name__ == "__main__":
    solve()