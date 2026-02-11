<?php
// PHP 8 solution

function modmul($a, $b, $mod) {
    return ($a % $mod) * ($b % $mod) % $mod;
}

function modprod($arr, $mod) {
    $res = 1;
    foreach ($arr as $v) {
        $res = ($res * (($v + 1) % $mod)) % $mod;
    }
    return $res;
}

function solve() {
    $MOD = 1000000007;

    [$n, $k] = array_map('intval', explode(" ", trim(fgets(STDIN))));
    $a = array_map('intval', explode(" ", trim(fgets(STDIN))));
    sort($a);

    $have = array_flip($a);

    // compute max possible mex (longest prefix from 0)
    $mexLimit = 0;
    while (isset($have[$mexLimit])) {
        $mexLimit++;
    }

    $ans = 0;

    // Try all candidate mex values from 0..$mexLimit
    for ($mex = 0; $mex <= $mexLimit; $mex++) {
        // check feasibility: all 0..mex-1 must exist
        $ok = true;
        for ($x = 0; $x < $mex; $x++) {
            if (!isset($have[$x])) {
                $ok = false;
                break;
            }
        }
        if (!$ok) break;

        // copy array
        $b = $a;
        // put all k increments into largest element
        $b[count($b)-1] += $k;
        $prod = modprod($b, $MOD);

        $ans = max($ans, ($mex * $prod) % $MOD);
    }

    echo $ans % $MOD . PHP_EOL;
}

solve();
