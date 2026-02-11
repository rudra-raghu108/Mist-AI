import sys
from math import gcd

def solve():
    data = list(map(int, sys.stdin.read().strip().split()))
    it = iter(data)
    T = next(it)
    out_lines = []

    for _ in range(T):
        N = next(it)
        arr = [next(it) for _ in range(N)]
        Q = next(it)
        queries = [next(it) for _ in range(Q)]

        reachable = set()
        for a in arr:
            new = {a}
            for g in reachable:
                new.add(gcd(g, a))
            reachable |= new
        for k in queries:
            out_lines.append('Y' if k in reachable else 'N')
    sys.stdout.write("\n".join(out_lines))
if __name__ == "__main__":
    solve()