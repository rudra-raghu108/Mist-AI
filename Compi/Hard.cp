#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <utility>

using namespace std;

const int MOD = 10007;

using Matrix = vector<vector<pair<int, int>>>;

int MAT_SIZE;

// Function to multiply two sparse matrices (represented by adjacency lists)
Matrix multiply(const Matrix& a, const Matrix& b) {
    Matrix result(MAT_SIZE);
    for (int i = 0; i < MAT_SIZE; ++i) {
        if (a[i].empty()) continue;
        map<int, int> temp_row;
        // For each non-zero element a[i][j]
        for (auto const& [j, val_a] : a[i]) {
            if (b[j].empty()) continue;
            // Multiply by row j of b
            for (auto const& [k, val_b] : b[j]) {
                temp_row[k] = (temp_row[k] + val_a * val_b) % MOD;
            }
        }
        for (auto const& [k, val] : temp_row) {
            result[i].push_back({k, val});
        }
    }
    return result;
}

// Function to compute matrix exponentiation for sparse matrices
Matrix matrix_pow(Matrix base, long long exp) {
    Matrix result(MAT_SIZE);
    for (int i = 0; i < MAT_SIZE; ++i) {
        result[i].push_back({i, 1}); // Start with identity matrix
    }
    while (exp > 0) {
        if (exp % 2 == 1) {
            result = multiply(result, base);
        }
        base = multiply(base, base);
        exp /= 2;
    }
    return result;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    cin >> s;
    long long n;
    cin >> n;

    int s_len = s.length();

    map<pair<int, int>, int> id_map;
    int current_id = 0;
    for (int i = 0; i < s_len; ++i) {
        for (int j = i; j < s_len; ++j) {
            id_map[{i, j}] = current_id++;
        }
    }
    int DONE_STATE = current_id;
    MAT_SIZE = DONE_STATE + 1;

    Matrix T(MAT_SIZE);

    for (int i = 0; i < s_len; ++i) {
        for (int j = i; j < s_len; ++j) {
            int u = id_map.at({i, j});
            if (i == j) {
                T[u].push_back({DONE_STATE, 1}); // Match s[i], go to DONE
                T[u].push_back({u, 25});          // Don't match s[i], stay
            } else if (s[i] == s[j]) {
                int ni = i + 1, nj = j - 1;
                int v = (ni > nj) ? DONE_STATE : id_map.at({ni, nj});
                T[u].push_back({v, 1});   // Match s[i] and s[j]
                T[u].push_back({u, 25});  // Don't match s[i], stay
            } else { // s[i] != s[j]
                T[u].push_back({id_map.at({i + 1, j}), 1}); // Match s[i]
                T[u].push_back({id_map.at({i, j - 1}), 1}); // Match s[j]
                T[u].push_back({u, 24});                   // Don't match either, stay
            }
        }
    }
    T[DONE_STATE].push_back({DONE_STATE, 26}); // Stay in DONE state

    long long total_len = s_len + n;
    long long m = total_len / 2;
    int rem = total_len % 2;

    if (m == 0) { // Handle case with no pairs to add
        if (rem == 0) {
            cout << (s_len == 0) << endl;
        } else {
            bool is_palindrome = true;
            for(int i = 0; i < s_len/2; ++i) {
                if (s[i] != s[s_len-1-i]) {
                    is_palindrome = false;
                    break;
                }
            }
            cout << is_palindrome << endl;
        }
        return 0;
    }
    
    Matrix T_m = matrix_pow(T, m);

    int start_node = id_map.at({0, s_len - 1});
    
    map<int, int> final_counts;
    for (auto const& [v, val] : T_m[start_node]) {
         final_counts[v] = val;
    }

    long long ans = 0;
    if (rem == 0) {
        if(final_counts.count(DONE_STATE)){
            ans = final_counts[DONE_STATE];
        }
    } else {
        if(final_counts.count(DONE_STATE)){
            ans = (final_counts[DONE_STATE] * 26LL) % MOD;
        }
        for (int i = 0; i < s_len; ++i) {
            int node_id = id_map.at({i, i});
            if(final_counts.count(node_id)){
                 ans = (ans + final_counts[node_id]) % MOD;
            }
        }
    }

    cout << ans << endl;

    return 0;
}