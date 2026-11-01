# Parsec 17 · the test suite on 16.3 and on 17

The same 113 scripts, the same runner (`tests/run.py`), against the 16.3 test build and the Parsec 17 test build (the day of the migration). Each build was run in full three at a time; tests that differed were run again alone on both, several times where they kept flipping.

**74 of 113 pass on 16.3 · 73 of 113 pass on 17.** 112 tests give the same result on both builds; the 1 that differ are timing-sensitive checks that flip on both (noted below).

Reading the old ones: a test's number is the Parsec version it came with. `t5`, `t9`, `t10`, `t11` and most `t12*` scripts drive screens that changed on purpose since (Console → Technician page, the RO page layout, the clock card) and fail on both builds the same way; they are kept as history until someone updates or deletes them (docs/NEXT.md, item 8). The tests from 14.6 on (`t146*` … `t163*`) are the live ones: 22 of 25 pass on both; the three that don't (`t149w`, `t160a`, `t160b`) fail the same way on 16.3 — a 16.1 wording change, a timing race in the test, and 16.2's automation timestamps in the sample.

| test | Parsec 16.3 | Parsec 17 | note |
|---|---|---|---|
| t10a | error 0/0 | error 0/0 |  |
| t10b | pass 0/0 | pass 0/0 |  |
| t10c | pass 0/0 | pass 0/0 |  |
| t10d | pass 0/0 | pass 0/0 |  |
| t10e | pass 0/0 | pass 0/0 |  |
| t10f | pass 0/0 | pass 0/0 |  |
| t10p | pass 0/0 | pass 0/0 |  |
| t113 | pass 0/0 | pass 0/0 |  |
| t113b | pass 0/0 | pass 0/0 |  |
| t113c | pass 0/0 | pass 0/0 |  |
| t11a | error 0/0 | error 0/0 |  |
| t11b | error 0/0 | error 0/0 |  |
| t11c | error 0/0 | error 0/0 |  |
| t11d | error 0/0 | error 0/0 |  |
| t11dbg | error 0/0 | error 0/0 |  |
| t11e | error 0/0 | error 0/0 |  |
| t120_dbg | error 0/0 | error 0/0 |  |
| t121 | pass 30/30 | pass 30/30 |  |
| t122 | pass 36/36 | pass 36/36 |  |
| t122_early | fail 12/16 | fail 12/16 |  |
| t122d | fail 12/16 | fail 12/16 |  |
| t123 | fail 9/13 | fail 9/13 |  |
| t124 | fail 13/27 | fail 13/27 |  |
| t124_127p | pass 33/33 | fail 32/34 | ≠ “draws itself when it just happened” is timing-sensitive; it flipped on both builds between runs |
| t125 | fail 4/8 | fail 4/8 |  |
| t125_127p | fail 23/25 | fail 23/25 |  |
| t125b | fail 41/45 | fail 41/45 |  |
| t125b_127p | pass 43/43 | pass 43/43 |  |
| t125c | pass 61/61 | pass 61/61 |  |
| t125d | pass 49/49 | pass 49/49 |  |
| t125dbg | fail 4/8 | fail 4/8 |  |
| t126 | pass 44/44 | pass 44/44 |  |
| t127e | pass 124/124 | pass 124/124 |  |
| t127f | pass 44/44 | pass 44/44 | slow (3–4 min); timed out on 16.3 under load, passes alone on both |
| t127p | fail 32/34 | fail 32/34 |  |
| t127t | pass 3/3 | pass 3/3 |  |
| t128 | pass 22/22 | pass 22/22 |  |
| t129 | pass 28/28 | pass 28/28 |  |
| t12b | error 0/0 | error 0/0 |  |
| t12base | pass 0/0 | pass 0/0 |  |
| t12c | pass 0/0 | pass 0/0 |  |
| t12c_b | pass 0/0 | pass 0/0 |  |
| t12c_ocr | pass 0/0 | pass 0/0 |  |
| t12c_tech | pass 0/0 | pass 0/0 |  |
| t12d | error 0/0 | error 0/0 |  |
| t12d_860 | error 0/0 | error 0/0 |  |
| t12d_dbg | error 0/0 | error 0/0 |  |
| t12d_th | error 0/0 | error 0/0 |  |
| t12d_undo | pass 0/0 | pass 0/0 |  |
| t12d_undo2 | pass 0/0 | pass 0/0 |  |
| t12i | fail 35/37 | fail 35/37 | a sample name check that fails on both since 16.2 |
| t12i_bb | fail 35/37 | fail 35/37 |  |
| t12i_cc | fail 35/37 | fail 35/37 |  |
| t12ocr | error 0/0 | error 0/0 |  |
| t130 | pass 11/11 | pass 11/11 |  |
| t130a | pass 33/33 | pass 33/33 |  |
| t130b | fail 4/4 | fail 4/4 | same on both |
| t130c | pass 28/28 | pass 28/28 |  |
| t131r | pass 28/28 | pass 28/28 |  |
| t131s | pass 113/113 | pass 113/113 |  |
| t132a | fail 32/34 | fail 32/34 | same on both |
| t132x | pass 50/50 | pass 50/50 |  |
| t132x_snip | pass 0/0 | pass 0/0 |  |
| t141 | fail 24/26 | fail 24/26 | “Done with no story · 0:00” depends on the clock; passed on both earlier, failed on both later |
| t142 | pass 17/17 | pass 17/17 |  |
| t143a | pass 20/20 | pass 20/20 |  |
| t143b | pass 21/21 | pass 21/21 |  |
| t144 | pass 11/11 | pass 11/11 |  |
| t146a | pass 13/13 | pass 13/13 |  |
| t146g | pass 22/22 | pass 22/22 |  |
| t146t | pass 38/38 | pass 38/38 |  |
| t147a | pass 22/22 | pass 22/22 |  |
| t147b | pass 26/26 | pass 26/26 |  |
| t147c | pass 21/21 | pass 21/21 |  |
| t148a | pass 26/26 | pass 26/26 |  |
| t148b | pass 27/27 | pass 27/27 |  |
| t149d | pass 19/19 | pass 19/19 |  |
| t149e | pass 21/21 | pass 21/21 |  |
| t149t | pass 28/28 | pass 28/28 |  |
| t149w | fail 7/11 | fail 7/11 | wording changed in 16.1 (stamps removed); same on both |
| t14b | pass 30/30 | pass 30/30 |  |
| t14c | fail 28/32 | fail 28/32 | same on both |
| t14t | pass 27/27 | pass 27/27 |  |
| t150a | pass 24/24 | pass 24/24 |  |
| t150b | pass 21/21 | pass 21/21 |  |
| t150c | pass 30/30 | pass 30/30 |  |
| t160a | fail 81/83 | fail 81/83 | a timing race in the test (a save during adopt); fails or passes on both depending on the minute |
| t160b | fail 45/53 | fail 45/53 | 16.2's autoFired timestamps and the sample's random fields — on both |
| t160c | pass 38/38 | pass 38/38 |  |
| t161a | pass 33/33 | pass 33/33 |  |
| t162a | pass 57/57 | pass 57/57 |  |
| t162b | pass 61/61 | pass 61/61 |  |
| t162c | pass 56/56 | pass 56/56 |  |
| t163a | pass 40/40 | pass 40/40 |  |
| t163b | pass 46/46 | pass 46/46 |  |
| t163c | pass 53/53 | pass 53/53 |  |
| t5_base | fail 0/2 | fail 0/2 |  |
| t99 | error 0/0 | error 0/0 |  |
| t99p | pass 0/0 | pass 0/0 |  |
| team | pass 0/0 | pass 0/0 |  |
| team2 | pass 0/0 | pass 0/0 |  |
| tour | pass 0/0 | pass 0/0 |  |
| tour14 | pass 0/0 | pass 0/0 |  |
| trk1 | pass 0/0 | pass 0/0 |  |
| trk2 | error 0/0 | error 0/0 |  |
| trk3 | error 0/0 | error 0/0 |  |
| trk4 | pass 0/0 | pass 0/0 |  |
| trk5 | error 0/0 | error 0/0 |  |
| trk6 | pass 0/0 | pass 0/0 |  |
| trk7 | pass 0/0 | pass 0/0 |  |
| trk7b | pass 0/0 | pass 0/0 |  |
| trk8 | error 0/0 | error 0/0 |  |
| tst14 | pass 0/0 | pass 0/0 |  |
