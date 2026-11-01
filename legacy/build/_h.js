
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const D={"ros": [{"no": "37602", "cust": "Triad Cold Chain", "unit": "88", "veh": "2022 Volvo VNL", "cat": "wrk", "st": "working", "sub": "Repairing", "spot": "B2", "age": "3d", "tech": "MR", "hold": ["tech", "Mike Rodriguez", 1.2, 8], "stage": 4, "ready": "Today 15:40", "live": true, "ops": [["Alternator not charging \u2013 replace alternator", 1180, "ok"], ["DOT inspection", 260, "ok"]], "chk": [0, 2, false, true, false], "ct": [], "tl": [[7.0, "wrk"]], "ev": [], "late": false, "warr": null, "next": "", "stn": "Working"}, {"no": "37538", "cust": "Blue Ridge Haulage", "unit": "4417", "veh": "2020 Volvo VNL", "cat": "wrk", "st": "hold", "sub": "", "spot": "B3", "age": "15d", "tech": "MR", "hold": ["writer", "Dana Kowalski", 3.5, 4], "stage": 4, "ready": "Thu 10:04", "ops": [["Clutch slipping \u2013 replace clutch", 2499, "ok"], ["Wheel seal leaking", 540, null], ["PM service \u2013 A", 238, "ok"]], "chk": [1, 3, false, true, false], "ct": [["Text", "8:05", "Dana Kowalski", "Update given", "Clutch is in; wheel seal needs approval."], ["Call", "9:40", "Dana Kowalski", "Left voicemail", "Approval for op 2 \u2014 $540."]], "tl": [[7.0, "wrk"]], "ev": [[8.08, "text"], [9.67, "call"]], "next": "Operation 2 isn't approved yet \u2014 call Blue Ridge back.", "late": false, "live": false, "warr": null, "stn": "Hold tech"}, {"no": "37544", "cust": "Greensboro City Waste", "unit": "4061", "veh": "2020 Volvo VHD", "cat": "wrk", "st": "working", "sub": "Diagnosing", "spot": "B1", "age": "2d", "tech": "LM", "hold": ["tech", "Luis Martinez", 0.8, 8], "stage": 1, "ready": "Thu 09:30", "ops": [["Air dryer purging constantly", 320, "ok"]], "chk": [0, 1, true, false, false], "ct": [["In person", "7:20", "Dana Kowalski", "Update given", "Fleet manager stopped by; diag today."]], "tl": [[7.0, "wrk"]], "ev": [[7.33, "person"]], "late": false, "live": false, "warr": null, "next": "", "stn": "Working"}, {"no": "37011", "cust": "Catawba Timber", "unit": "330", "veh": "2019 Volvo VNL", "cat": "wrk", "st": "foreman", "sub": "", "spot": "B5", "age": "8d", "tech": "PS", "hold": ["foreman", "Ray Owens", 5.2, 2], "stage": 4, "ready": "Thu 17:00", "ops": [["Comeback \u2013 coolant loss after head gasket", 0, "warr"], ["Coolant hose kit", 410, "ok"]], "chk": [0, 2, false, true, false], "ct": [], "tl": [[7.0, "wrk"]], "ev": [[8.5, "xfer"]], "late": false, "live": false, "warr": null, "next": "", "stn": "Waiting \u2013 Foreman"}, {"no": "36988", "cust": "Old Salem Moving", "unit": "61", "veh": "2017 Volvo VNM", "cat": "wrk", "st": "support", "sub": "Awaiting reply", "spot": "B6", "age": "11d", "tech": "PS", "hold": ["warranty", "Kim Lee", 26, 24], "stage": 1, "ready": "\u2014", "warr": [53, 7], "ops": [["Intermittent no-start, U0100 lost comms with ECM", 0, "warr"]], "chk": [0, 1, false, false, false], "ct": [["Email", "9:05", "Kim Lee", "Update given", "Case 4-118 sent to Volvo tech support."]], "tl": [[7.0, "wrk"]], "ev": [[9.08, "email"]], "late": false, "live": false, "next": "", "stn": "Waiting \u2013 Tech support"}, {"no": "37420", "cust": "Guilford Paving", "unit": "902", "veh": "2020 Volvo VHD", "cat": "wrk", "st": "parts", "sub": "Ordered \u00b7 due Thu", "spot": "UP", "age": "6d", "tech": "LM", "hold": ["parts", "Parts desk", 20, 24], "stage": 3, "ready": "Fri 12:00", "ops": [["Hydraulic PTO leak at the pump", 1960, "ok"], ["Hose replacement", 380, "ok"], ["Pressure test", 210, "ok"]], "chk": [0, 3, false, true, false], "ct": [["Call", "Wed 16:10", "Dana Kowalski", "Update given", "PTO pump due Thursday."]], "tl": [[7.0, "wrk"]], "ev": [], "late": false, "live": false, "warr": null, "next": "", "stn": "Waiting \u2013 Parts"}, {"no": "34601", "cust": "Carolina Line Freight", "unit": "2210", "veh": "2019 Volvo VNR", "cat": "wrk", "st": "parts", "sub": "Backordered \u00b7 due Fri", "spot": "AW1", "age": "9d", "tech": "MR", "hold": ["parts", "Parts desk", 40, 24], "stage": 3, "ready": "Mon 14:00", "warr": [70, 3], "ops": [["Check engine light \u2013 DPF differential pressure high", 0, "warr"], ["Replace DPF", 0, "warr"]], "chk": [1, 2, false, true, false], "ct": [["Text", "7:45", "Dana Kowalski", "Update given", "DPF backordered \u2014 due Friday."]], "tl": [[7.0, "wrk"]], "ev": [[7.75, "text"]], "late": false, "live": false, "next": "", "stn": "Waiting \u2013 Parts"}, {"no": "37590", "cust": "Yadkin Valley Logistics", "unit": "1204", "veh": "2018 Volvo VNL", "cat": "apr", "st": "customer", "sub": "Estimate sent", "spot": "C3", "age": "26h", "tech": "LM", "hold": ["writer", "Dana Kowalski", 26, 4], "stage": 2, "ready": "Fri 16:00", "late": true, "ops": [["Front brakes grinding \u2013 brake job", 1280, null], ["Slack adjusters", 360, null]], "chk": [0, 2, false, false, false], "ct": [["Text", "Wed 8:10", "Dana Kowalski", "Update given", "Estimate $1,640 sent."], ["Call", "9:20", "Dana Kowalski", "No answer", ""], ["Call", "10:02", "Dana Kowalski", "Left voicemail", "Asked for a yes or no on the brakes."]], "tl": [[7.0, "apr"]], "ev": [[9.33, "call"], [10.03, "call"]], "next": "No answer on the estimate for 26 h \u2014 try the fleet manager.", "live": false, "warr": null, "stn": "Waiting \u2013 Customer"}, {"no": "37516", "cust": "Sandhills Grain", "unit": "77", "veh": "2019 Volvo VNL", "cat": "apr", "st": "customer", "sub": "Approval pending", "spot": "C4", "age": "7h", "tech": "PS", "hold": ["writer", "Dana Kowalski", 7, 4], "stage": 2, "ready": "Mon 10:00", "ops": [["Steer axle kingpin play", 860, null]], "chk": [0, 1, false, true, false], "ct": [["Call", "8:40", "Dana Kowalski", "Will call back", "Owner checking with the fleet manager."]], "tl": [[7.0, "apr"]], "ev": [[8.67, "call"]], "late": false, "live": false, "warr": null, "next": "", "stn": "Waiting \u2013 Customer"}, {"no": "37628", "cust": "Rowan Ready Mix", "unit": "2203", "veh": "2021 Volvo VNR", "cat": "apr", "st": "customer", "sub": "Estimate sent", "spot": "C5", "age": "1h", "tech": "LM", "hold": ["writer", "Dana Kowalski", 1, 4], "stage": 2, "ready": "Fri 15:00", "ops": [["Turbo whistle and low power", 2480, null], ["Charge air cooler leak", 640, null]], "chk": [0, 2, false, false, false], "ct": [["Email", "9:15", "Dana Kowalski", "Update given", "Estimate $3,120 sent."]], "tl": [[7.6, "chk"], [9.2, "apr"]], "ev": [[9.25, "email"]], "late": false, "live": false, "warr": null, "next": "", "stn": "Waiting \u2013 Customer"}, {"no": "37555", "cust": "Haw River Dairy", "unit": "17", "veh": "2023 Volvo VNR", "cat": "chk", "st": "hold", "sub": "", "spot": "T1", "age": "3h", "tech": "", "hold": ["foreman", "Ray Owens", 3, 1], "stage": 0, "ready": "Today 13:30", "late": true, "ops": [["PM service \u2013 A", 238, "ok"]], "chk": [0, 1, false, false, false], "ct": [["In person", "7:15", "Dana Kowalski", "Update given", "Driver dropped it off for PM-A."]], "tl": [[7.25, "chk"]], "ev": [[7.25, "person"]], "next": "Checked in 3 h ago with no tech \u2014 assign one.", "live": false, "warr": null, "stn": "Hold tech"}, {"no": "35112", "cust": "Piedmont Aggregates", "unit": "318", "veh": "2021 Volvo VHD", "cat": "chk", "st": "hold", "sub": "", "spot": "T2", "age": "40m", "tech": "MR", "hold": ["tech", "Mike Rodriguez", 0.6, 8], "stage": 0, "ready": "Fri 11:30", "ops": [["Air leak at the front axle", 250, "ok"]], "chk": [0, 1, false, false, false], "ct": [], "tl": [[9.6, "chk"]], "ev": [], "late": false, "live": false, "warr": null, "next": "", "stn": "Hold tech"}, {"no": "37641", "cust": "Dixie Fleet Services", "unit": "5102", "veh": "2022 Volvo VNL", "cat": "arr", "st": "hold", "sub": "", "spot": "W1", "age": "11:30", "tech": "", "hold": ["writer", "Dana Kowalski", 1.3, 4], "stage": 0, "ready": "\u2014", "ops": [["Coolant leak, front of engine", 0, null]], "chk": [0, 1, false, false, false], "ct": [["Call", "8:55", "Dana Kowalski", "Update given", "Driver about 40 minutes out."]], "tl": [], "ev": [[8.92, "call"]], "late": false, "live": false, "warr": null, "next": "", "stn": "Hold tech"}, {"no": "37644", "cust": "Mount Airy Movers", "unit": "230", "veh": "2018 Volvo VNM", "cat": "arr", "st": "hold", "sub": "", "spot": "W2", "age": "13:00", "tech": "", "hold": ["writer", "Dana Kowalski", 0.5, 4], "stage": 0, "ready": "\u2014", "ops": [["Liftgate inoperative", 0, null]], "chk": [0, 1, false, false, false], "ct": [], "tl": [], "ev": [], "late": false, "live": false, "warr": null, "next": "", "stn": "Hold tech"}, {"no": "37489", "cust": "Pilot Mountain Express", "unit": "5530", "veh": "2021 Volvo VNL", "cat": "rdy", "st": "roadtest", "sub": "", "spot": "D1", "age": "2h", "tech": "MR", "hold": ["writer", "Dana Kowalski", 2, 2], "stage": 5, "ready": "Today 12:15", "ops": [["Overhead and injector cups", 3340, "ok"], ["Valve cover gasket", 410, "ok"]], "chk": [2, 2, true, true, true], "ct": [["Call", "9:55", "Dana Kowalski", "Update given", "Ready at noon; driver on the way."]], "tl": [[7.0, "wrk"], [8.25, "rdy"]], "ev": [[8.2, "check"], [9.92, "call"]], "late": false, "live": false, "warr": null, "next": "", "stn": "Complete \u2013 Road test"}, {"no": "37301", "cust": "Uwharrie Fuel", "unit": "12", "veh": "2016 Volvo VNL", "cat": "rdy", "st": "roadtest", "sub": "", "spot": "D2", "age": "28h", "tech": "LM", "hold": ["writer", "Dana Kowalski", 28, 2], "stage": 5, "ready": "Wed 12:00", "late": true, "ops": [["Turbo actuator fault \u2013 replace actuator", 1720, "ok"], ["Software update", 0, "warr"]], "chk": [2, 2, true, false, true], "ct": [["Call", "Wed 15:00", "Dana Kowalski", "No answer", ""], ["Text", "Wed 15:05", "Dana Kowalski", "Update given", "Ready for pickup."]], "tl": [[7.0, "rdy"]], "ev": [], "next": "Ready since yesterday \u2014 one punch has no note, then release.", "live": false, "warr": null, "stn": "Complete \u2013 Road test"}, {"no": "37460", "cust": "Lexington Bottling", "unit": "44", "veh": "2019 Volvo VNL", "cat": "rdy", "st": "declined", "sub": "", "spot": "D3", "age": "4h", "tech": "PS", "hold": ["writer", "Dana Kowalski", 4, 2], "stage": 6, "ready": "Today", "ops": [["Diagnose ABS light", 210, "ok"], ["Replace ABS module", 1890, "no"]], "chk": [1, 1, true, true, true], "ct": [["Call", "8:00", "Dana Kowalski", "Declined", "Declined op 2 \u2014 release as is."]], "tl": [[7.0, "apr"], [8.0, "rdy"]], "ev": [[8.0, "call"], [8.02, "appr"]], "late": false, "live": false, "warr": null, "next": "", "stn": "Declined"}], "rel": [{"no": "37220", "cust": "Elkin Hardwoods", "at": "8:40", "spot": "\u2014"}, {"no": "37388", "cust": "Surry Feed & Seed", "at": "9:30", "spot": "\u2014"}]}, I={"console": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3.75\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"3.75\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/></svg>", "ros": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M13.5 3.75V8.5h4.75\"/><path d=\"M8.5 12.5h7M8.5 16h4.5\"/></svg>", "foreman": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"5\" y=\"4.75\" width=\"14\" height=\"15.5\" rx=\"2.5\"/><path d=\"M9.5 4.75V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v.75M8.75 10.5h6.5M8.75 14h6.5M8.75 17.25h3.5\"/></svg>", "manager": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"9.25\" cy=\"8.25\" r=\"3.25\"/><path d=\"M3.5 19.5c0-3.2 2.6-5.25 5.75-5.25s5.75 2.05 5.75 5.25\"/><path d=\"M15.5 5.3a3.2 3.2 0 0 1 0 5.9M17.2 14.6c2 .6 3.3 2.2 3.3 4.4\"/></svg>", "triage": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"12.25\" rx=\"2.75\"/><path d=\"M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M12 10.75v5.5M9.25 13.5h5.5\"/></svg>", "timelog": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.25V12l3.25 1.9\"/></svg>", "parts": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/></svg>", "career": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 19.5v-5M10 19.5v-11M15 19.5v-7.5M20 19.5V5\"/></svg>", "warranty": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z\"/><path d=\"M8.9 12.1l2.2 2.2 4.1-4.4\"/></svg>", "fixes": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>", "newRo": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 8v8M8 12h8\"/></svg>", "gear": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 8h8.5M17 8h3M4 16h3M11.5 16H20\"/><circle cx=\"14.75\" cy=\"8\" r=\"2.25\"/><circle cx=\"9.25\" cy=\"16\" r=\"2.25\"/></svg>", "bell": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 16.75V11a6 6 0 0 1 12 0v5.75l1.5 1.5h-15z\"/><path d=\"M10 20.5a2.25 2.25 0 0 0 4 0\"/></svg>", "search": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/></svg>", "plus": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 5v14M5 12h14\"/></svg>", "play": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z\"/></svg>", "stop": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2.75\"/></svg>", "swap": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M7 7.5h12.5L16 4M17 16.5H4.5L8 20\"/></svg>", "user": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"3.75\"/><path d=\"M4.75 20c.6-3.6 3.6-5.75 7.25-5.75s6.65 2.15 7.25 5.75\"/></svg>", "print": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M7 9V4.5h10V9\"/><rect x=\"3.75\" y=\"9\" width=\"16.5\" height=\"7.5\" rx=\"2\"/><path d=\"M7 14.5h10v5H7z\"/></svg>", "trash": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4.5 6.5h15M9.5 6.5V4.75h5V6.5M6.5 6.5l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3l.9-12.2M10 10.5v5.5M14 10.5v5.5\"/></svg>", "clock": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/></svg>", "keyTag": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"15.5\" r=\"4\"/><path d=\"M10.9 12.6l8.6-8.6M16.5 7l2.5 2.5M14 9.5l2 2\"/></svg>", "history": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.75h3.75\"/><path d=\"M12 8.5V12l2.5 1.5\"/></svg>", "save": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5.5 4h10.2L20 8.3v10.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4z\"/><path d=\"M8 4v4.5h7V4M8 20v-6h8v6\"/></svg>", "addJob": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M13.5 3.75V8.5h4.75\"/><path d=\"M12 11v6M9 14h6\"/></svg>", "addPart": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/><path d=\"M19 15v6M16 18h6\"/></svg>", "pencil": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4.75 19.25l1-4L15.6 5.4a1.9 1.9 0 0 1 2.7 0l.3.3a1.9 1.9 0 0 1 0 2.7L8.75 18.25z\"/><path d=\"M14 7l3 3\"/></svg>", "note": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 3.75h12A1.25 1.25 0 0 1 19.25 5v9.5l-4.75 5.75H6A1.25 1.25 0 0 1 4.75 19V5A1.25 1.25 0 0 1 6 3.75z\"/><path d=\"M14.5 20.25v-4.5a1.25 1.25 0 0 1 1.25-1.25h3.5M8 8.5h8M8 12h5\"/></svg>", "copy": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2.5\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/></svg>", "eye": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.75 12S6 5.75 12 5.75 21.25 12 21.25 12 18 18.25 12 18.25 2.75 12 2.75 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>", "clip": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M19.4 11.2l-7.1 7.2a4.4 4.4 0 0 1-6.2-6.2l7.6-7.6a2.9 2.9 0 0 1 4.1 4.1l-7.3 7.3a1.4 1.4 0 0 1-2-2l6.6-6.6\"/></svg>", "check": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"/></svg>", "x": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 6l12 12M18 6L6 18\"/></svg>", "unit": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.75 16.5V7.25A1.5 1.5 0 0 1 4.25 5.75h9.25v10.75M13.5 9.25h3.6a1.5 1.5 0 0 1 1.2.6l2.2 2.9a1.5 1.5 0 0 1 .3.9v2.85h-2\"/><circle cx=\"7\" cy=\"17.25\" r=\"2\"/><circle cx=\"16.5\" cy=\"17.25\" r=\"2\"/><path d=\"M9 17.25h5.5\"/></svg>", "sun": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4\"/></svg>", "moon": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M19.5 14.5A8 8 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z\"/></svg>", "chat": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H11.5L7 20v-3.5h-.25A2.25 2.25 0 0 1 4.5 14.25z\"/></svg>", "exit": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 8l-4 4 4 4M6 12h9\"/></svg>", "chevD": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6.5 9.5L12 15l5.5-5.5\"/></svg>", "chevU": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6.5 14.5L12 9l5.5 5.5\"/></svg>", "chevR": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9.5 6.5L15 12l-5.5 5.5\"/></svg>", "more": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5.5 12h.01M12 12h.01M18.5 12h.01\" stroke-width=\"2.4\"/></svg>", "inbox": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3.75 13.5l2.6-7.1A1.5 1.5 0 0 1 7.76 5.4h8.48a1.5 1.5 0 0 1 1.41 1l2.6 7.1v4.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5z\"/><path d=\"M3.75 13.5h4.5l1.25 2h5l1.25-2h4.5\"/></svg>", "sidebar": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3.75\" y=\"4.75\" width=\"16.5\" height=\"14.5\" rx=\"2.75\"/><path d=\"M9.5 4.75v14.5\"/></svg>", "link": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1\"/></svg>", "phone": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z\"/></svg>", "mail": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3.75\" y=\"5.75\" width=\"16.5\" height=\"12.5\" rx=\"2.25\"/><path d=\"M4.5 7.25l7.5 5.75 7.5-5.75\"/></svg>", "userPlus": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"10\" cy=\"8\" r=\"3.5\"/><path d=\"M3.75 19.5c.6-3.4 3.2-5.25 6.25-5.25s5.65 1.85 6.25 5.25M18.5 7.5v5M16 10h5\"/></svg>", "pin": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z\"/><circle cx=\"12\" cy=\"10.25\" r=\"2.25\"/></svg>", "flag": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6\"/></svg>", "release": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4.5 12h11M11.5 7.5L16 12l-4.5 4.5M19.5 5v14\"/></svg>", "inArrow": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M19.5 12h-11M12.5 7.5L8 12l4.5 4.5M4.5 5v14\"/></svg>", "list": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M8.5 6.5h11M8.5 12h11M8.5 17.5h11\"/><circle cx=\"4.75\" cy=\"6.5\" r=\".9\"/><circle cx=\"4.75\" cy=\"12\" r=\".9\"/><circle cx=\"4.75\" cy=\"17.5\" r=\".9\"/></svg>", "ring": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8\"/></svg>"}, SI={"hold": "<svg class=\"px-si\" data-s=\"hold\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/></svg>", "working": "<svg class=\"px-si\" data-s=\"working\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><path d=\"M7 3.5a3.5 3.5 0 0 1 0 7z\" fill=\"currentColor\"/></svg>", "parts": "<svg class=\"px-si\" data-s=\"parts\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-dasharray=\"2.3 1.82\"/><circle cx=\"7\" cy=\"7\" r=\"1.75\" fill=\"currentColor\"/></svg>", "foreman": "<svg class=\"px-si\" data-s=\"foreman\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-dasharray=\"2.3 1.82\"/><circle cx=\"7\" cy=\"7\" r=\"1.75\" fill=\"currentColor\"/></svg>", "support": "<svg class=\"px-si\" data-s=\"support\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-dasharray=\"2.3 1.82\"/><circle cx=\"7\" cy=\"7\" r=\"1.75\" fill=\"currentColor\"/></svg>", "customer": "<svg class=\"px-si\" data-s=\"customer\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-dasharray=\"2.3 1.82\"/><circle cx=\"7\" cy=\"7\" r=\"1.75\" fill=\"currentColor\"/></svg>", "roadtest": "<svg class=\"px-si\" data-s=\"roadtest\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><path d=\"M7 3.5a3.5 3.5 0 1 1-3.5 3.5H7z\" fill=\"currentColor\"/></svg>", "released": "<svg class=\"px-si\" data-s=\"released\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"6\" fill=\"currentColor\"/><path d=\"M4.4 7.2l1.8 1.8 3.5-3.7\" fill=\"none\" stroke=\"var(--panel)\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "declined": "<svg class=\"px-si\" data-s=\"declined\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"6\" fill=\"currentColor\"/><path d=\"M5 5l4 4M9 5l-4 4\" fill=\"none\" stroke=\"var(--panel)\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>", "problem": "<svg class=\"px-si\" data-s=\"problem\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-dasharray=\"2.3 1.82\"/><circle cx=\"7\" cy=\"7\" r=\"1.75\" fill=\"currentColor\"/></svg>"}, LOGO="<svg viewBox=\"-110 -110 220 220\" aria-hidden=\"true\"><circle class=\"c\" r=\"14\"/><circle cx=\"44\" r=\"9.5\"/><circle cx=\"-44\" r=\"9.5\"/><circle cx=\"22\" cy=\"38\" r=\"9.5\"/><circle cx=\"-22\" cy=\"38\" r=\"9.5\"/><circle cx=\"22\" cy=\"-38\" r=\"9.5\"/><circle cx=\"-22\" cy=\"-38\" r=\"9.5\"/><circle cy=\"-84\" r=\"7\" class=\"o\"/><circle cy=\"84\" r=\"7\" class=\"o\"/><circle cx=\"73\" cy=\"42\" r=\"7\" class=\"o\"/><circle cx=\"-73\" cy=\"42\" r=\"7\" class=\"o\"/><circle cx=\"73\" cy=\"-42\" r=\"7\" class=\"o\"/><circle cx=\"-73\" cy=\"-42\" r=\"7\" class=\"o\"/></svg>";
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CAT={arr:['Arriving','var(--ink-4)'],chk:['Checked in','var(--status-support)'],apr:['Awaiting approval','var(--status-customer)'],wrk:['In repair','var(--status-working)'],rdy:['Ready to release','var(--ink)'],rel:['Released today','var(--ink-3)']};
const ORDER=['arr','chk','apr','wrk','rdy'];
const ROLE={tech:['TE','Technician'],writer:['AP','Approval'],parts:['PT','Parts'],foreman:['FM','Foreman'],manager:['MG','Manager'],warranty:['WA','Warranty']};
const KIND={Call:'phone',Text:'chat',Email:'mail','In person':'user',appr:'check',xfer:'swap',check:'foreman',call:'phone',text:'chat',email:'mail',person:'user'};
const OUTC=o=>/Approved|Update/.test(o)?'ok':/Declined/.test(o)?'no':'mid';
const STG=['Check-in','Diag','Approval','Parts','Repair','Road test','Close-out'];
const ROS=D.ros; let SEL=ROS[1].no, IDEA=1;
const get=no=>ROS.find(r=>r.no===no);
const sq=c=>`<i class="sq" style="background:${CAT[c][1]}"></i>`;
const spot=s=>`<span class="tg-spot">${I.pin}${esc(s)}</span>`;
const age=r=>`<span class="tg-age${r.late?' late':''}">${r.cat==='arr'?'~'+esc(r.age):esc(r.age)}</span>`;
const st=r=>`${SI[r.st]}<span>${esc(r.stn.replace('Hold tech','Hold tech'))}${r.sub?` <span style="color:var(--ink-3)">· ${esc(r.sub.split(' · ')[0])}</span>`:''}</span>`;
const av=t=>`<span class="px-av" title="${esc(t)}">${t||'—'}</span>`;
const lastCt=r=>{const c=r.ct[r.ct.length-1];return c?`<span class="tg-ct">${I[KIND[c[0]]]}<b>${esc(c[3])}</b> · ${esc(c[1])}</span>`:`<span class="tg-ct">${I.phone}No contact yet</span>`;};
const held=r=>{const [to,who,h,g]=r.hold, o=h>g;return `<span class="tg-held${o?' over':''}"><span class="tg-role">${ROLE[to][0]}</span><span class="m"><i class="${o?'over':''}" style="width:${Math.min(100,h/g*100)}%"></i></span>${h<1?Math.round(h*60)+'m':h.toFixed(h<10?1:0)+'h'} / ${g}h</span>`;};
const checks=r=>{const [a,b,p,n,rt]=r.chk;const L=[a===b,p,n,rt,!/^Waiting/.test(r.stn)];return `<span class="tg-checks" title="Ready to close">${L.map(x=>`<i class="${x?'ok':''}"></i>`).join('')}</span>`;};
const ticks=r=>`<span class="tg-ticks">${STG.map((_,i)=>`<i class="${i<r.stage?'done':i===r.stage?(r.cat==='apr'?'wait':'now'):''}"></i>`).join('')}</span>`;
const ring=(r,size=44)=>{const R=size/2-4,C=2*Math.PI*R,done=r.stage+(r.cat==='rdy'?1:0);return `<svg class="tg-ring${r.cat==='rdy'?' ok':''}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="t" cx="${size/2}" cy="${size/2}" r="${R}"/><circle class="p" cx="${size/2}" cy="${size/2}" r="${R}" stroke-dasharray="${(C*done/7).toFixed(1)} ${C.toFixed(1)}"/></svg>`;};
const money=n=>'$'+n.toLocaleString('en-US');
const appr=r=>{let ok=0,op=0,no=0;r.ops.forEach(o=>{if(o[2]==='ok')ok+=o[1];else if(o[2]==='no')no+=o[1];else if(o[2]===null)op+=o[1];});return {ok,op,no};};
function needs(){const L=[];ROS.forEach(r=>{
  if(r.cat==='apr')L.push([r,r.late?0:3,'phone',r.ct.length?`${r.sub} ${r.age} ago · ${r.ct[r.ct.length-1][3].toLowerCase()}`:`${r.sub} ${r.age} ago`,r.late?'Call back':'Follow up','Waiting on customers']);
  else if(r.cat==='rdy')L.push([r,r.late?1:2,'release',`${r.stn==='Declined'?'Declined':'Road test done'} · ${r.spot}${r.late?' · waiting '+r.age:''}`,'Release','Ready to go']);
  else if(r.cat==='chk'&&!r.tech)L.push([r,1,'userPlus',`Checked in ${r.age} ago · no tech yet`,'Assign','Ready to go']);
  else if(r.cat==='arr')L.push([r,5,'inArrow',`Arriving ~${r.age} · ${r.spot}`,'Check in','Coming in']);
  else if(r.hold[2]>r.hold[3])L.push([r,4,'swap',`With ${ROLE[r.hold[0]][1].toLowerCase()} ${Math.round(r.hold[2])}h · goal ${r.hold[3]}h`,'Nudge','Held too long']);});
  return L.sort((a,b)=>a[1]-b[1]);}

/* ---------- the selected-RO pane (used by several ideas) ---------- */
function closeList(r){const [a,b,p,n,rt]=r.chk;const hold=/^Waiting/.test(r.stn);
  return [[a===b,'All operations complete',`${a} of ${b}`],[p,'Parts installed',p?'all installed':'not all installed'],[n,'Notes written',n?'every punch has a note':'1 punch with no note'],[rt,'Road test done',rt?'Pass':'not logged'],[!hold,'Holding',hold?r.stn.replace('Waiting – ','Waiting on '):'nothing blocking']];}
function closeHtml(r){return `<div class="tg-close">${closeList(r).map(x=>`<div class="tg-cl${x[0]?' ok':''}"><i></i><span>${x[1]}</span><small>${esc(x[2])}</small></div>`).join('')}</div>`;}
function feed(r,max){const L=r.ct.slice().reverse().slice(0,max||9);return L.length?`<div class="tg-feed">${L.map(c=>`<div class="tg-fe"><span class="gi">${I[KIND[c[0]]]}</span><span><b>${esc(c[0])}</b> · <span class="tg-oc ${OUTC(c[3])}">${esc(c[3])}</span></span><time>${esc(c[1])}</time>${c[4]?`<p>${esc(c[4])}</p>`:''}</div>`).join('')}</div>`:'<p style="margin:0;font-size:13px;color:var(--ink-3)">No calls or messages yet.</p>';}
function pane(r){const a=appr(r);
  return `<aside class="tg-pane"><div class="eb"><span class="tg-ro">RO-${r.no}</span>${sq(r.cat)}<span>${CAT[r.cat][0]}</span><span style="margin-left:auto">${age(r)}</span></div>
  <h2>${esc(r.cust)}</h2><div class="sub">${esc(r.veh)} · Unit ${esc(r.unit)}</div>
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${spot(r.spot)}<button class="px-status--button" style="height:28px;font-size:13px">${st(r)}${I.chevD.replace('px-ico','px-ico px-chev')}</button>${r.warr?`<span class="tg-w">${I.warranty}${r.warr[0]}% ready</span>`:''}</div>
  ${r.next?`<div class="px-next"><div class="px-next__head"><span class="px-next__k">Next</span></div><div class="px-next__body"><p class="px-next__t">${esc(r.next)}</p></div></div>`:''}
  <div><div class="tg-sec">Who has it</div><div style="display:flex;align-items:center;gap:10px"><span class="tg-role">${ROLE[r.hold[0]][0]}</span><div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:500">${esc(r.hold[1])}</div><div style="font-size:12px;color:var(--ink-3)">${ROLE[r.hold[0]][1]} · holding ${r.hold[2]<1?Math.round(r.hold[2]*60)+'m':r.hold[2]+'h'}</div></div><button class="px-btn px-btn--sm">${I.swap}Transfer…</button></div></div>
  <div><div class="tg-sec">Customer</div>${feed(r,3)}<div class="tg-acts" style="margin-top:10px"><button class="px-btn px-btn--sm">${I.phone}Log a call</button><button class="px-btn px-btn--sm">${I.chat}Text</button></div></div>
  <div><div class="tg-sec">Ready to close</div>${closeHtml(r)}</div>
  <div class="tg-acts">${r.cat==='rdy'?`<button class="px-btn px-btn--primary">${I.release}Release</button>`:''}<button class="px-btn">Open RO</button><button class="px-btn">${I.pin}Move…</button></div></aside>`;}


SEL='37590'; let TAB='inbox', SRCH=false, MOVE=false, TOAST='', QV='';
const VIEWS=[['inbox','inbox','Inbox'],['desk','console','Desk'],['yard','pin','Yard']];
const T0=10.25; let NOW=T0;
const fmt=h=>{const m=Math.round(h*60),d=Math.floor(m/1440),mm=m%1440,s=`${Math.floor(mm/60)}:${String(mm%60).padStart(2,'0')}`;return d?'Fri '+s:s;};
const r5=h=>Math.round(h*12)/12;
const TECH={MR:'Mike Rodriguez',LM:'Luis Martinez',PS:'Pat Sutton'};
const HOLDER={writer:'Dana Kowalski',parts:'Parts desk',foreman:'Ray Owens',manager:'Tom Becker',warranty:'Kim Lee'};
const GOAL={tech:8,writer:4,parts:24,foreman:2,warranty:24,manager:4};
const OUTS=['Approved','Declined','Left voicemail','No answer','Update given','Will call back'];
const FOLLOW={'Left voicemail':2,'No answer':1,'Update given':4};
const GORD=['Waiting on customers','Ready to go','Held too long','Coming in'];
const CLR0=[{at:7.83,ic:'inArrow',what:'Checked in to T3',no:'37628',cust:'Rowan Ready Mix'},{at:8.03,ic:'x',what:'Logged decline on op 2',no:'37460',cust:'Lexington Bottling'},{at:8.67,ic:'release',what:'Released',no:'37220',cust:'Elkin Hardwoods'},{at:9.17,ic:'userPlus',what:'Assigned to Mike Rodriguez',no:'35112',cust:'Piedmont Aggregates'},{at:9.5,ic:'release',what:'Released',no:'37388',cust:'Surry Feed & Seed'}];
const INIT=JSON.stringify({ros:ROS,rel:D.rel});
let SNZ={}, BACK={}, CLR=JSON.parse(JSON.stringify(CLR0)), UNDO=[], NT=null, POP=null, KB=false, HELP=false, OPEN={snz:false,clr:false};
const newLF=()=>({kind:'Call',out:null,when:null,note:''});
let LFP=newLF(), LFC=newLF();

/* ---------- what needs action right now ---------- */
const etaH=r=>{const [h,m]=String(r.age).split(':').map(Number);return h+(m||0)/60;};
function needsNow(){return needs().filter(x=>{const r=x[0];if(SNZ[r.no])return false;if(r.cat==='arr'&&etaH(r)-NOW>1.5)return false;return true;})
  .map(x=>{const y=x.slice(),b=BACK[y[0].no];if(b)y[3]=b.why?`${b.why} · snoozed ${fmt(b.at)}`:`Snoozed ${fmt(b.at)}`;y[3]=y[3].replace('Checked in 0m ago','Checked in just now');return y;});}
function grouped(){const N=needsNow(),G={};GORD.forEach(g=>G[g]=[]);N.forEach(x=>G[x[5]].push(x));
  GORD.forEach(g=>G[g].sort((a,b)=>(BACK[b[0].no]?1:0)-(BACK[a[0].no]?1:0)||a[1]-b[1]));return G;}
const flat=()=>{const G=grouped();return GORD.flatMap(g=>G[g].map(x=>x[0].no));};
const itemOf=no=>needsNow().find(x=>x[0].no===no);
const whenOpts=()=>[['In 1 hour',r5(NOW+1)],['In 2 hours',r5(NOW+2)],['After lunch',NOW<12.5?13:r5(NOW+3)],['End of day',Math.max(16.5,r5(NOW+.5))],['Tomorrow morning',32]];
const freeSpots=()=>{const used=new Set(ROS.map(r=>r.spot));return ['T1','T2','T3','B4','B7','B8','W3','W4'].filter(s=>!used.has(s)).slice(0,4);};

/* ---------- actions ---------- */
function snap(){UNDO.push(JSON.stringify({ros:ROS,rel:D.rel,SNZ,BACK,CLR,SEL}));if(UNDO.length>30)UNDO.shift();}
function undo(){if(!UNDO.length)return;const s=JSON.parse(UNDO.pop());ROS.splice(0,ROS.length,...s.ros);D.rel.splice(0,D.rel.length,...s.rel);SNZ=s.SNZ;BACK=s.BACK;CLR=s.CLR;SEL=s.SEL;POP=null;toast('Undone',false);render();}
let TT=0;function toast(msg,can=true){const id=++TT;NT={msg,can,id};setTimeout(()=>{if(NT&&NT.id===id){NT=null;const el=$('.nx-toast');if(el)el.remove();}},6500);}
const SHORT=w=>w.replace(/^Assigned to (\S)\S* (\S).*$/,'Assigned · $1$2').replace(/^Checked in to /,'Checked in · ').replace(/^Logged decline.*$/,'Declined').replace(/^Transferred to /,'To ');
const clr=(ic,what,r)=>CLR.push({at:NOW,ic,what,no:r.no,cust:r.cust});
function snooze(no,until,why){const r=get(no);SNZ[no]={until,why:why||'',at:NOW};delete BACK[no];toast(`${r.cust} snoozed until ${fmt(until)}`);}
function run(no,fn){const L=flat(),i=L.indexOf(no),el=$(`.i3-it[data-sel="${no}"]`);POP=null;
  const go=()=>{fn();const L2=flat();if(!L2.includes(SEL)){SEL=L2.length?L2[Math.min(Math.max(i,0),L2.length-1)]:SEL;}render();};
  if(el){el.classList.add('out');setTimeout(go,190);}else go();}
function applyLog(S,no){const r=get(no),inList=!!itemOf(no),a=appr(r);snap();delete BACK[no];
  r.ct.push([S.kind,fmt(NOW),'Dana Kowalski',S.out,S.note.trim()]);r.ev.push([NOW,KIND[S.kind]==='chat'?'text':KIND[S.kind]==='mail'?'email':KIND[S.kind]==='user'?'person':'call']);
  if(S.out==='Approved'){r.ops.forEach(o=>{if(o[2]===null)o[2]='ok';});if(r.cat==='apr'){r.cat='wrk';r.st='hold';r.stn='Hold tech';r.sub='';r.late=false;r.next='';r.stage=3;r.hold=['tech',TECH[r.tech]||'Technician',0,8];}clr('check',a.op?`Approved ${money(a.op)}`:'Approved',r);toast(`Approved${a.op?' '+money(a.op):''} · back to ${TECH[r.tech]||'the tech'}`);}
  else if(S.out==='Declined'){r.ops.forEach(o=>{if(o[2]===null)o[2]='no';});if(r.cat==='apr'){r.cat='rdy';r.st='declined';r.stn='Declined';r.sub='';r.late=false;r.next='';r.stage=6;r.age='0m';r.hold=['writer','Dana Kowalski',0,2];}clr('x','Logged decline',r);toast('Declined · now ready to release');}
  else if(inList){const until=S.out==='Will call back'?S.when:r5(NOW+FOLLOW[S.out]);snooze(no,until,S.out==='Will call back'?'Said they’d call back':S.out);}
  else toast(`${S.kind} logged on RO-${r.no}`);}
function doRelease(no){const r=get(no);snap();ROS.splice(ROS.indexOf(r),1);D.rel.push({no:r.no,cust:r.cust,at:fmt(NOW),spot:r.spot});delete BACK[no];clr('release','Released',r);toast(`Released RO-${r.no} · ${r.spot} is free`);}
function doAssign(no,code){const r=get(no);snap();r.tech=code;r.hold=['tech',TECH[code],0,8];delete BACK[no];clr('userPlus',`Assigned to ${TECH[code]}`,r);toast(`Assigned to ${TECH[code]}`);}
function doCheckin(no,sp){const r=get(no);snap();Object.assign(r,{cat:'chk',spot:sp,tech:'',age:'0m',st:'hold',stn:'Hold tech',sub:'',hold:['foreman','Ray Owens',0,1]});r.tl.push([NOW,'chk']);delete BACK[no];clr('inArrow',`Checked in to ${sp}`,r);toast(`Checked in to ${sp} · needs a tech`);}
function doNudge(no){const r=get(no);snap();SNZ[no]={until:r5(NOW+1),why:`Nudged ${r.hold[1]}`,at:NOW};delete BACK[no];toast(`Nudged ${r.hold[1]} · back at ${fmt(r5(NOW+1))} if still held`);}
function doXfer(no,role){const r=get(no);snap();const who=role==='tech'?(TECH[r.tech]||'Mike Rodriguez'):HOLDER[role];r.hold=[role,who,0,GOAL[role]];delete BACK[no];if(!itemOf(no))clr('swap',`Transferred to ${ROLE[role][1]}`,r);toast(`Transferred to ${who} · ${ROLE[role][1]}`);}
function act(no){const x=itemOf(no);if(!x)return;SEL=no;const b=x[4];
  if(b==='Call back'||b==='Follow up')openPop('log',no);else if(b==='Release')openPop('release',no);else if(b==='Assign')openPop('assign',no);else if(b==='Check in')openPop('checkin',no);else if(b==='Nudge')run(no,()=>doNudge(no));}
function openPop(type,no){if(type==='snooze'&&!itemOf(no))return;SEL=no;POP={type,no,i:0};if(type==='log')LFP=newLF();if(type==='xfer'){const k=['writer','tech','parts','foreman','warranty','manager'];POP.i=k.indexOf(get(no).hold[0])===0?1:0;}render();}
function popN(){return POP.type==='snooze'?5:POP.type==='assign'?3:POP.type==='xfer'?6:POP.type==='checkin'?freeSpots().length:POP.type==='release'?1:0;}
function popPick(i){const no=POP.no,t=POP.type;
  if(t==='snooze'){const h=whenOpts()[i][1];run(no,()=>{snap();snooze(no,h,'');});}
  else if(t==='assign')run(no,()=>doAssign(no,['MR','LM','PS'][i]));
  else if(t==='xfer')run(no,()=>doXfer(no,['writer','tech','parts','foreman','warranty','manager'][i]));
  else if(t==='checkin')run(no,()=>doCheckin(no,freeSpots()[i]));
  else if(t==='release')run(no,()=>doRelease(no));}
function submitLog(sc){const S=sc==='p'?LFP:LFC,no=sc==='p'?POP.no:SEL;if(!S.out)return;const keep={...S};run(no,()=>applyLog(keep,no));if(sc==='p')LFP=newLF();else LFC=newLF();}
function tick(h){NOW=r5(NOW+h);let n=0;Object.keys(SNZ).forEach(no=>{if(SNZ[no].until<=NOW+1e-6){BACK[no]={at:SNZ[no].at,why:SNZ[no].why};delete SNZ[no];n++;}});if(n)toast(`${n} back from snooze`,false);render();}
function clearAll(){snap();for(let p=0;p<6;p++){const N=needsNow();if(!N.length)break;N.forEach(([r,_,__,___,b])=>{const no=r.no;
  if(b==='Release'){ROS.splice(ROS.indexOf(r),1);D.rel.push({no,cust:r.cust,at:fmt(NOW),spot:r.spot});clr('release','Released',r);}
  else if(b==='Assign'){r.tech='LM';r.hold=['tech',TECH.LM,0,8];clr('userPlus','Assigned to Luis Martinez',r);}
  else if(b==='Check in'){const sp=freeSpots()[0];Object.assign(r,{cat:'chk',spot:sp,tech:'',age:'0m',st:'hold',stn:'Hold tech',hold:['foreman','Ray Owens',0,1]});clr('inArrow',`Checked in to ${sp}`,r);}
  else if(b==='Nudge')SNZ[no]={until:r5(NOW+1),why:`Nudged ${r.hold[1]}`,at:NOW};
  else{r.ct.push(['Call',fmt(NOW),'Dana Kowalski','Left voicemail',''] );SNZ[no]={until:r5(NOW+2),why:'Left voicemail',at:NOW};}
  delete BACK[no];});}
  if(!get(SEL))SEL=ROS[0].no;POP=null;TOP0=true;toast('Demo · worked through the whole list');render();}
function reset(){const s=JSON.parse(INIT);ROS.splice(0,ROS.length,...s.ros);D.rel.splice(0,D.rel.length,...s.rel);SNZ={};BACK={};CLR=JSON.parse(JSON.stringify(CLR0));UNDO=[];NT=null;POP=null;NOW=T0;SEL='37590';KB=false;OPEN={snz:false,clr:false};TOP0=true;render();}

/* ---------- the log form (popover and the Inbox composer share it) ---------- */
function follow(S,r){if(!S.out)return ['','Pick an outcome'];
  if(S.out==='Approved'){const a=appr(r);return ['ok',a.op?`Approves ${money(a.op)} open and clears the item`:'Logs it and clears the item'];}
  if(S.out==='Declined')return ['no','Declines what’s open — the RO moves to Ready to release'];
  if(!itemOf(r.no))return ['','Logs it on the RO'];
  if(S.out==='Will call back')return ['snz',`Back in the list at ${fmt(S.when)}`];
  const h=FOLLOW[S.out];return ['snz',`Back in the list at ${fmt(r5(NOW+h))} · ${h} h`];}
function logForm(S,sc,r){const f=follow(S,r),ic=f[0]==='snz'?I.clock:f[0]==='ok'?I.check:f[0]==='no'?I.x:'';
  const kinds=`<div class="lf-r"><span class="lbl">Log</span>${['Call','Text','Email','In person'].map(k=>`<button class="tg-chip${S.kind===k?' on':''}" data-lf-kind="${k}">${I[KIND[k]]}${k}</button>`).join('')}</div>`;
  const outs=`<div class="lf-r"><span class="lbl">Outcome</span>${OUTS.map((k,i)=>`<button class="tg-chip${S.out===k?' on':''}" data-lf-out="${k}">${sc==='p'?`<span class="px-kbd">${i+1}</span>`:''}${k}</button>`).join('')}</div>`;
  const when=S.out==='Will call back'&&itemOf(r.no)?`<div class="lf-r lf-when"><span class="lbl">When did they say?</span>${whenOpts().map(([l,h])=>`<button class="tg-chip${S.when===h?' on':''}" data-lf-when="${h}" title="${l}">${fmt(h)}</button>`).join('')}</div>`:'';
  const ta=`<textarea rows="1" data-lf-note placeholder="Note — e.g. approved $540 for op 2">${esc(S.note)}</textarea>`;
  const go=`<button class="px-btn px-btn--primary px-btn--sm" data-lf-go${S.out?'':' disabled'}>Log it<span class="px-kbd">↵</span></button>`;
  const fu=`<span class="lf-fu ${f[0]}">${ic}<span>${f[1]}</span></span>`;
  return sc==='p'?`<div class="lf" data-lf="p">${kinds}${outs}${when}${ta}<div class="lf-r lf-f">${fu}${go}</div><div class="lf-hint"><span><span class="px-kbd">1</span>–<span class="px-kbd">6</span> outcome</span><span><span class="px-kbd">N</span> note</span><span><span class="px-kbd">Esc</span> close</span></div></div>`
   :`<div class="lf" data-lf="c">${kinds.replace('<span class="lbl">Log</span>','<span class="lbl">Log</span>')}${outs}${when}<div class="lf-r lf-nf">${ta}${fu}${go}</div></div>`;}

/* ---------- popovers ---------- */
function popHtml(){if(!POP)return '';const r=get(POP.no);if(!r)return '';const head=(k)=>`<div class="nx-ph"><span class="k">${k}</span><span class="tg-ro">RO-${r.no}</span><b>${esc(r.cust)}</b><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>`;
  const mi=(i,inner)=>`<button class="px-menu__item${POP.i===i?' is-hover':''}" data-pick-i="${i}"><span class="px-kbd">${i+1}</span>${inner}</button>`;
  const ft=t=>`<div class="ft">${t}</div>`;
  if(POP.type==='log')return `<div class="nx-pop px-pop">${head('Log a contact')}${logForm(LFP,'p',r)}</div>`;
  if(POP.type==='snooze')return `<div class="nx-pop px-pop menu">${head('Snooze until')}${whenOpts().map(([l,h],i)=>mi(i,`${l}<span class="px-menu__meta">${fmt(h)}</span>`)).join('')}${ft('Comes back at the top of its group.')}</div>`;
  if(POP.type==='assign'){const load=c=>ROS.filter(x=>x.tech===c&&(x.cat==='wrk'||x.cat==='chk')).length;return `<div class="nx-pop px-pop menu">${head('Assign')}${['MR','LM','PS'].map((c,i)=>mi(i,`<span class="px-av">${c}</span>${TECH[c]}<span class="px-menu__meta">${load(c)} on the yard</span>`)).join('')}${ft('Clears the item. The tech sees it on their Console.')}</div>`;}
  if(POP.type==='xfer'){const ks=['writer','tech','parts','foreman','warranty','manager'];return `<div class="nx-pop px-pop menu">${head('Transfer to')}${ks.map((k,i)=>mi(i,`<span class="tg-role">${ROLE[k][0]}</span>${ROLE[k][1]}<span class="px-menu__meta">${r.hold[0]===k?'has it now':k==='tech'?(TECH[r.tech]||'—'):HOLDER[k]}</span>`)).join('')}${ft(`Held ${r.hold[2]<1?Math.round(r.hold[2]*60)+'m':r.hold[2]+'h'} by ${esc(r.hold[1])} — the clock restarts.`)}</div>`;}
  if(POP.type==='checkin')return `<div class="nx-pop px-pop menu">${head('Check in to')}${freeSpots().map((s,i)=>mi(i,`${ZONE(s)}<span class="px-menu__meta px-id">${s}</span>`)).join('')}${ft('Then it moves to Ready to go → Assign.')}</div>`;
  if(POP.type==='release')return `<div class="nx-pop px-pop menu">${head('Release')}<div class="card"><div>${I.keyTag}Key tag <span class="px-id">1${r.no.slice(-2)}</span> back on the board</div><div>${I.pin}${ZONE(r.spot)} <span class="px-id">${r.spot}</span> frees up</div><div>${I.check}Moves to Released today</div></div><div class="acts"><button class="px-btn px-btn--sm" data-close>Cancel<span class="px-kbd">Esc</span></button><button class="px-btn px-btn--primary px-btn--sm" data-pick-i="0">${I.release}Release<span class="px-kbd">↵</span></button></div></div>`;
  return '';}

/* ---------- left: Needs action ---------- */
function inboxList(){const G=grouped(),L=flat(),r=get(SEL);
  const item=([x,_,icn,why,btn])=>{const on=x.no===SEL,k=on&&KB;return `<div class="i3-it${on?' on':''}${k?' kb':''}" data-sel="${x.no}" data-spot="${x.spot}">${x.late?'<i class="dot"></i>':''}<span class="gi">${I[icn]}</span><span class="t"><span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b>${BACK[x.no]?`<span class="nx-back">${I.clock}Back</span>`:''}${spot(x.spot)}</span><span class="w${x.late&&!BACK[x.no]?' late':''}">${esc(why)}</span><button class="px-btn px-btn--sm px-btn--icon px-btn--ghost nx-snz" data-pop="snooze" data-no="${x.no}" title="Snooze  S">${I.clock}</button><button class="px-btn px-btn--sm${btn==='Release'?' px-btn--primary':''}" data-act="${x.no}">${btn}${k?'<span class="px-kbd">↵</span>':''}</button></div>`;};
  const sn=Object.keys(SNZ).map(no=>({no,...SNZ[no]})).filter(s=>get(s.no)).sort((a,b)=>a.until-b.until);
  const arr=ROS.filter(x=>x.cat==='arr'&&etaH(x)-NOW>1.5);
  const cleared=`<div class="nx-sec${OPEN.clr?' open':''}" data-open="clr">${I.chevR}<span>Cleared today</span><span class="n">${CLR.length}</span></div>${OPEN.clr?`<div class="nx-rows">${CLR.slice().reverse().map(c=>`<div class="nx-row done"${get(c.no)?` data-sel="${c.no}" style="cursor:pointer"`:''} title="${esc(c.what)}"><time>${fmt(c.at)}</time><span class="tg-ro">${c.no}</span><b>${esc(c.cust)}</b><small>${I[c.ic]}${esc(SHORT(c.what))}</small></div>`).join('')}</div>`:''}`;
  let body;
  if(!L.length){const up=[...sn.map(s=>({t:s.until,html:`<time>${fmt(s.until)}</time><span class="tg-ro">${s.no}</span><b>${esc(get(s.no).cust)}</b><small>${I.clock}${esc(s.why||'Snoozed by hand')}</small>`,no:s.no})),...arr.map(x=>({t:etaH(x),html:`<time>~${x.age}</time><span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b><small>${I.inArrow}Arriving · ${x.spot}</small>`,no:x.no}))].sort((a,b)=>a.t-b.t).slice(0,6);
    body=`<div class="nx-empty"><div class="ring">${I.check}</div><h3>All caught up</h3><p>Nothing needs you right now.</p>${up.length?`<div class="nx-up"><div class="h">Coming up</div>${up.map(u=>`<div class="nx-row" data-sel="${u.no}">${u.html}</div>`).join('')}</div>`:''}</div>${cleared}`;}
  else body=GORD.filter(g=>G[g].length).map(g=>`<div class="i3-grp">${g}<span>${G[g].length}</span></div>`+G[g].map(item).join('')).join('')
    +(sn.length?`<div class="nx-sec${OPEN.snz?' open':''}" data-open="snz">${I.chevR}<span>Snoozed</span><span class="n">${sn.length}</span><span class="m">next back ${fmt(sn[0].until)}</span></div>${OPEN.snz?`<div class="nx-rows">${sn.map(s=>`<div class="nx-row" data-sel="${s.no}"><time>${fmt(s.until)}</time><span class="tg-ro">${s.no}</span><b>${esc(get(s.no).cust)}</b><small>${esc(s.why||'Snoozed by hand')}</small><button class="px-btn px-btn--sm px-btn--ghost" data-wake="${s.no}">Wake</button></div>`).join('')}</div>`:''}`:'')+cleared;
  const x=itemOf(SEL);
  const out=L.length&&!L.includes(SEL)&&r?`<div class="ib-out">${SNZ[SEL]?`<b>RO-${r.no}</b> is snoozed until ${fmt(SNZ[SEL].until)}.`:`Showing <b>RO-${r.no} · ${esc(r.cust)}</b> — nothing waiting on it.`}</div>`:'';
  const keys=`<div class="nx-keys"><span><span class="px-kbd">J</span><span class="px-kbd">K</span>move</span>${x?`<span><span class="px-kbd">↵</span><b>${x[4]}</b></span>`:''}<span><span class="px-kbd">S</span>snooze</span><span><span class="px-kbd">T</span>transfer</span><span class="sp"></span><button data-help title="All keys"><span class="px-kbd">?</span>more</button></div>`;
  const nt=NT?`<div class="nx-toast"><span>${esc(NT.msg)}</span>${NT.can&&UNDO.length?`<button data-nundo>Undo<span class="px-kbd">Ctrl Z</span></button>`:''}</div>`:'';
  return `<div class="i3-list"><div class="i3-lh">Needs action<span class="n">${L.length}</span><button class="nx-done" data-open="clr">${I.check}${CLR.length} cleared today</button></div><div class="i3-scroll">${body}</div>${out}${keys}${nt}</div>`;}

/* ---------- view 1 · Inbox (conversation + composer) ---------- */
function vInbox(r){const a=appr(r);
  const thread=r.ct.map(c=>`<div class="i3-m"><span class="gi">${I[KIND[c[0]]]}</span><div class="bd"><div class="hd"><b>${esc(c[0])}</b><span class="tg-oc ${OUTC(c[3])}">${esc(c[3])}</span><span style="color:var(--ink-3)">${esc(c[2])}</span><time>${esc(c[1])}</time></div>${c[4]?`<p>${esc(c[4])}</p>`:''}</div></div>`).join('');
  const sz=SNZ[r.no]?`<div class="i3-m sys"><span class="gi">${I.clock}</span><div class="bd"><div class="hd">Snoozed until <b style="color:var(--ink)">${fmt(SNZ[r.no].until)}</b>${SNZ[r.no].why?' · '+esc(SNZ[r.no].why):''}<time>${fmt(SNZ[r.no].at)}</time></div></div></div>`:'';
  return `<div class="i3-main"><div class="i3-top"><div class="r1"><span class="tg-ro">RO-${r.no}</span>${sq(r.cat)}<span>${CAT[r.cat][0]}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2>
   <div class="r2">${spot(r.spot)}${ticks(r)}<span style="display:inline-flex;gap:6px;align-items:center">${st(r)}</span>${held(r)}<span style="margin-left:auto;display:flex;gap:8px"><button class="px-btn px-btn--sm" data-pop="xfer" data-no="${r.no}">${I.swap}Transfer…</button><button class="px-btn px-btn--sm">Open RO</button></span></div></div>
   <div class="i3-thread"><span class="i3-day">This RO · calls, texts, approvals and transfers</span>${thread||'<div class="i3-m sys"><span class="gi">'+I.phone+'</span><div class="bd"><div class="hd">No contact logged yet</div></div></div>'}${sz}
    ${xferRows(r)}
    <div class="i3-appr"><div class="h">${I.check}Approvals<span>Approved ${money(a.ok)} · open ${money(a.op)}${a.no?' · declined '+money(a.no):''}</span></div>${r.ops.map((o,i)=>`<div class="i3-op"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}">Approve</button><button class="${o[2]==='part'?'on':''}">Partly</button><button class="${o[2]==='no'?'on no':''}">Decline</button></span>`}</div>`).join('')}</div>
   </div>
   <div class="i3-comp">${logForm(LFC,'c',r)}</div></div>`;}
/* ---------- view 2 · Desk ---------- */
function vDesk(r){const a=appr(r);
  const steps=STG.map((n,i)=>`<div class="i7-step ${i<r.stage?'done':i===r.stage?(r.cat==='apr'?'wait':'now'):''}"><i></i><b>${n}</b><small>${i<r.stage?'done':i===r.stage?'now':'—'}</small></div>`).join('');
  const done=closeList(r).filter(x=>x[0]).length,C=2*Math.PI*22;
  const n=needsNow().find(x=>x[0]===r);const t=r.next||(n?n[3]:'Nothing waiting on anyone — keep going.');
  return `<div class="i7-main"><div class="i7-hd"><div class="l"><div class="eb"><span class="tg-ro">RO-${r.no}</span>·<span>${esc(r.veh)} · Unit ${esc(r.unit)}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2></div><div class="r">${spot(r.spot)}<button class="px-status--button">${st(r)}${I.chevD.replace('px-ico','px-ico px-chev')}</button></div></div>
   <div class="i7-strip"><div class="tg-sec" style="display:flex;gap:8px">Stage<span style="color:var(--ink-2)">${STG[r.stage]} · ${r.stage+1} of 7</span><span style="margin-left:auto">ready ${esc(r.ready)}</span></div><div class="i7-steps">${steps}</div></div>
   <div class="i7-next"><span class="k">Next</span><p>${esc(t.charAt(0).toUpperCase()+t.slice(1))}</p><button class="px-btn px-btn--sm" data-pop="log" data-no="${r.no}">${I.phone}Log a call</button>${n?`<button class="px-btn px-btn--accent px-btn--sm" data-act="${r.no}">${n[4]}</button>`:''}</div>
   <div class="i7-two"><div class="i7-card"><div class="h">${I.phone}Customer<small>${r.ct.length} contact${r.ct.length===1?'':'s'}</small></div>${feed(r,3)}<div class="i7-log">${['Call','Text','Email','In person'].map(k=>`<button class="tg-chip">${I[KIND[k]]}${k}</button>`).join('')}</div></div>
    <div class="i7-card"><div class="h">${I.check}Approvals<small>approved ${money(a.ok)} · open ${money(a.op)}</small></div>${r.ops.map((o,i)=>`<div class="i3-op" style="padding:8px 0"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}">Approve</button><button>Partly</button><button class="${o[2]==='no'?'on no':''}">Decline</button></span>`}</div>`).join('')}</div></div>
   <div class="i7-two"><div class="i7-card"><div class="h">Ready to close<small>${done} of 5</small>${r.cat==='rdy'?`<button class="px-btn px-btn--sm px-btn--primary" data-act="${r.no}" style="margin-left:10px">${I.release}Release…</button>`:''}</div><div class="i7-rtc"><svg class="tg-ring${done===5?' ok':''}" width="56" height="56" viewBox="0 0 56 56"><circle class="t" cx="28" cy="28" r="22"/><circle class="p" cx="28" cy="28" r="22" stroke-dasharray="${(C*done/5).toFixed(1)} ${C.toFixed(1)}"/></svg>${closeHtml(r)}</div></div>
    <div class="i7-card"><div class="h">${I.swap}Who has it</div><div style="display:flex;align-items:center;gap:10px"><span class="tg-role">${ROLE[r.hold[0]][0]}</span><div style="flex:1"><div style="font-weight:500;font-size:14px">${esc(r.hold[1])}</div><div style="font-size:12.5px;color:var(--ink-3)">${ROLE[r.hold[0]][1]}</div></div><button class="px-btn px-btn--sm px-btn--primary" data-pop="xfer" data-no="${r.no}">Transfer…</button></div><div style="margin-top:12px">${held(r)}</div>${xferDesk(r)}<div class="tg-kv" style="margin-top:14px"><span>Tech</span><b style="font-weight:400">${r.tech||'Unassigned'}</b><span>Key tag</span><b class="px-id">1${r.no.slice(-2)}</b><span>Ready about</span><b style="font-weight:400">${esc(r.ready)}</b></div></div></div>
  </div>`;}

/* ---------- view 3 · Yard ---------- */
const ZONE=id=>/^B\d/.test(id)?'Bay '+id.slice(1):id==='UP'?'UpTime bay':/^AW/.test(id)?'Awning':/^W/.test(id)?'Arrival line':/^T/.test(id)?'Triage lane '+id.slice(1):/^[CDE]/.test(id)?id[0]+' line':'Yard';
function vYard(r){const at={};ROS.forEach(x=>at[x.spot]=x);
  const s=(id)=>{const x=at[id];if(x)return `<button class="i2-s occ${x.no===SEL?' tg-sel':''}${MOVE&&x.no!==SEL?' dim':''}" data-sel="${x.no}" data-at="${id}" title="${esc(x.cust)}"><span class="l">${id}</span><b>${sq(x.cat)}${x.no.slice(-4)}${x.live?'<i class="tg-live"></i>':''}</b><small>${esc(x.cust)}</small><span class="fl">${x.warr?I.warranty:''}${x.late?'<i class="lt"></i>':''}</span></button>`;
    return MOVE?`<button class="i2-s free" data-free="${id}"><span class="l">${id}</span></button>`:`<div class="i2-s" data-at="${id}"><span class="l">${id}</span></div>`;};
  const grid=(ids,cols)=>`<div class="i2-g" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${ids.map(s).join('')}</div>`;
  const lot=(row,n)=>Array.from({length:n},(_,i)=>row+(i+1));
  const bar=MOVE?`<div class="yd-bar mv"><span class="k">Move</span><span><b style="font-weight:500">RO-${r.no} · ${esc(r.cust)}</b> from ${ZONE(r.spot)} <span class="px-id">${r.spot}</span> — pick a free spot</span><span class="sp"></span><button class="px-btn px-btn--sm" data-move="0">Cancel<span class="px-kbd">Esc</span></button></div>`
   :`<div class="yd-bar">${sq(r.cat)}<span class="tg-ro">RO-${r.no}</span><h3>${esc(r.cust)}</h3><span class="at">${I.pin}${ZONE(r.spot)}<b>${r.spot}</b></span><span class="stt">${st(r)}</span><span class="sp"></span><span style="font-size:12px;color:var(--ink-3);white-space:nowrap">Key tag <span class="px-id" style="color:var(--ink-2)">1${r.no.slice(-2)}</span></span><button class="px-btn px-btn--sm" data-move="1">${I.pin}Move…</button></div>`;
  return `<div class="yd">${bar}
   <div class="i2-row"><section class="i2-z" style="flex:1.55"><div class="i2-zh">Shop floor<small>UpTime · awning · bays 1–8</small></div>${grid(['UP','B1','B2','B3','B4','AW1','B5','B6','B7','B8'],5)}</section>
   <section class="i2-z" style="flex:1"><div class="i2-zh">Check-in<small>arrival line · triage lanes</small></div>${grid(['W1','W2','W3','W4'],4)}<div style="height:6px"></div>${grid(['T1','T2','T3'],4)}</section></div>
   <section class="i2-z"><div class="i2-zh">Parking lot<small>C · waiting on customers &nbsp;·&nbsp; D · ready to release &nbsp;·&nbsp; E · overflow</small></div>${grid(lot('C',10),10)}<div style="height:6px"></div>${grid(lot('D',10),10)}<div style="height:6px"></div>${grid(lot('E',10),10)}</section>
   <div class="i2-row"><section class="i2-z" style="flex:1"><div class="i2-zh">Warranty<small>on the yard</small></div><div style="display:flex;flex-direction:column;gap:6px">${ROS.filter(x=>x.warr).map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer" data-sel="${x.no}"><span class="tg-ro">${x.no}</span><b style="font-weight:500;white-space:nowrap">${esc(x.cust)}</b>${spot(x.spot)}<span style="margin-left:auto;color:var(--ink-3);font-size:12px;white-space:nowrap">${x.warr[0]}% · ${x.warr[1]} missing</span><span style="width:60px" class="i6-wb"><i style="width:${x.warr[0]}%"></i></span></div>`).join('')}</div></section>
   <section class="i2-z" style="flex:.8"><div class="i2-zh">Released today<small>${D.rel.length}</small></div><div style="display:flex;flex-direction:column;gap:6px">${D.rel.map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="tg-ro">${x.no}</span><b style="font-weight:500">${esc(x.cust)}</b><span style="margin-left:auto;color:var(--ink-3);font-size:12px">${x.at}</span></div>`).join('')}</div></section></div>
   <div class="i2-leg">${ORDER.map(k=>`<span>${sq(k)}${CAT[k][0]}</span>`).join('')}<span><i class="tg-live"></i>On the clock</span><span><i style="width:6px;height:6px;border-radius:50%;background:var(--warn);display:inline-block"></i>Late</span><span style="color:var(--accent-text)">${I.warranty}Warranty</span></div>
  </div>${TOAST?`<div class="yd-toast">${TOAST}<u data-undo>Undo</u></div>`:''}`;}

/* ---------- search (icon only, opens on click or /) ---------- */
function srPop(){const q=($('.tg-srch input')||{}).value||'';const L=ROS.filter(r=>!q||(r.no+' '+r.cust+' '+r.unit).toLowerCase().includes(q.toLowerCase())).slice(0,6);
  return `<div class="h">${q?'Matches':'Recent'}</div>${L.map((r,i)=>`<div class="it${i===0?' k':''}" data-sel="${r.no}" data-pick>${sq(r.cat)}<span class="tg-ro">${r.no}</span><b>${esc(r.cust)}</b>${spot(r.spot)}</div>`).join('')||'<div class="it" style="color:var(--ink-3)">No RO, unit or customer matches</div>'}<div class="ft"><span><span class="px-kbd">↵</span> open</span><span><span class="px-kbd">Esc</span> close</span><span style="margin-left:auto">RO, unit, customer or VIN</span></div>`;}


/* ---------- page ---------- */
const HELPK=[['List',[['Next item','J','↓'],['Previous item','K','↑'],['Do the item’s button','↵'],['Snooze…','S'],['Log a call or text','C'],['Transfer…','T'],['Undo','Ctrl','Z']]],['In a popover',[['Pick outcome or option','1','6'],['Write a note','N'],['Confirm','↵'],['Close','Esc']]],['Page',[['Inbox · Desk · Yard','1','3'],['Search','/'],['This list','?']]]];
const RAIL=['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'];
function helpHtml(){const col=gs=>`<div class="nx-kcol">${gs.map(([g,rows])=>`<div class="nx-kg">${g}</div>${rows.map(([l,...k])=>`<div class="nx-k">${l}<span class="ks">${k.map((x,i)=>`${i&&(l.includes('·')||l.startsWith('Pick'))?'–':''}<span class="px-kbd">${x}</span>`).join('')}</span></div>`).join('')}`).join('')}</div>`;
  return `<div class="px-scrim nx-help" data-help-close><div class="px-modal"><div class="px-modal__h"><div><h2>Keyboard</h2><p>Works anywhere on Triage when you’re not typing.</p></div><button class="px-btn px-btn--icon px-btn--ghost" data-help-close aria-label="Close">${I.x}</button></div><div class="px-modal__b"><div class="nx-kgrid">${col([HELPK[0]])}${col([HELPK[1],HELPK[2]])}</div></div><div class="px-modal__f"><span class="px-modal__hint"><span class="px-kbd">?</span> or <span class="px-kbd">Esc</span> to close</span></div></div></div>`;}
let TOP0=false;
function render(){if(!get(SEL))SEL=flat()[0]||ROS[0].no;const r=get(SEL);
  const sc=$('.i3-scroll'),keep=sc&&!TOP0&&flat().length?sc.scrollTop:0;TOP0=false;
  const facts=`<span><b>${ROS.length}</b> on the yard</span>·<span><b>${ROS.filter(r=>r.cat==='apr').length}</b> awaiting approval</span>·<span><b>${ROS.filter(r=>r.cat==='rdy').length}</b> ready to release</span>·<span class="w"><b>${ROS.filter(r=>r.late).length}</b> late</span>`;
  const views=`<div class="px-seg tg-views" role="tablist">${VIEWS.map(([k,ic,l],i)=>`<button role="tab" class="${TAB===k?'is-on':''}" data-view="${k}" title="${l} view (${i+1})">${I[ic]}${l}</button>`).join('')}</div>`;
  const search=`<span class="tg-srch${SRCH?' open':''}"><input class="px-input" placeholder="Search ROs"><span class="px-kbd">Esc</span><button class="px-btn px-btn--icon px-btn--ghost" data-search aria-label="Search">${I.search}<span class="tip">Search <span class="px-kbd" style="position:static;opacity:1;transform:none">/</span></span></button></span>`;
  const main=TAB==='inbox'?vInbox(r):TAB==='desk'?vDesk(r):vYard(r);
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${I.sidebar}</a><a>${I.search}</a><span class="ck"><i></i></span><span class="sep"></span>${RAIL.map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='triage'?'is-on':''}">${I[k]}</a>`).join('')}<span class="sp"></span><a>${I.gear}</a><span class="px-av px-av--md px-av--me">MR</span></aside>
   <section class="tg-panel"><header class="tg-head${SRCH?' sr-on':''}"><h1>Triage</h1><span class="tg-facts">${facts}</span>${views}<span class="tg-hsep"></span>${search}<button class="px-btn px-btn--primary">${I.plus}New RO</button><div class="sr-pop">${SRCH?srPop():''}</div></header>
   <div class="tg-body ib v-${TAB}">${inboxList()}<div class="ib-main">${main}</div>${popHtml()}</div></section></div>${HELP?helpHtml():''}`;
  const sc2=$('.i3-scroll');if(sc2){sc2.scrollTop=keep;const el=$('.i3-it.on',sc2);if(el&&KB){if(el.offsetTop<sc2.scrollTop+30)sc2.scrollTop=el.offsetTop-40;else if(el.offsetTop+el.offsetHeight>sc2.scrollTop+sc2.clientHeight-20)sc2.scrollTop=el.offsetTop+el.offsetHeight-sc2.clientHeight+40;}}
  if(POP){const p=$('.nx-pop'),body=$('.tg-body'),it=$(`.i3-it[data-sel="${POP.no}"]`);if(p){let top=16;if(it){top=(it.getBoundingClientRect().top-body.getBoundingClientRect().top)/scale-6;}top=Math.max(12,Math.min(top,body.offsetHeight-p.offsetHeight-12));p.style.top=top+'px';}}
  $('[data-clock]').textContent=fmt(NOW);
  if(SRCH){const i=$('.tg-srch input');i.value=QV;i.focus();i.setSelectionRange(QV.length,QV.length);}}
function setTab(t){TAB=t;MOVE=false;TOAST='';render();}
$$('[data-theme-set]').forEach(b=>b.onclick=()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));});
$$('[data-tt]').forEach(b=>b.onclick=()=>tick(+b.dataset.tt));
$('[data-reset]').onclick=reset; $('[data-caught]').onclick=clearAll;
let YUNDO=null;
mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s);
  if(HELP){if(q('[data-help-close]')&&(!q('.px-modal')||q('.px-btn'))){HELP=false;render();}return;}
  if(q('[data-help]')){HELP=true;render();return;}
  const vw=q('[data-view]');if(vw){setTab(vw.dataset.view);return;}
  if(q('[data-search]')){SRCH=!SRCH;QV='';render();return;}
  const mv=q('[data-move]');if(mv){MOVE=mv.dataset.move==='1';TOAST='';render();return;}
  const fr=q('[data-free]');if(fr){const r=get(SEL);YUNDO=[r.no,r.spot];TOAST=`Moved RO-${r.no} from ${r.spot} to ${fr.dataset.free}`;r.spot=fr.dataset.free;MOVE=false;render();return;}
  if(q('[data-undo]')&&YUNDO){get(YUNDO[0]).spot=YUNDO[1];YUNDO=null;TOAST='';render();return;}
  if(q('[data-close]')){POP=null;render();return;}
  const lf=q('[data-lf]');if(lf){const S=lf.dataset.lf==='p'?LFP:LFC,r=get(lf.dataset.lf==='p'?POP.no:SEL);
    const k=q('[data-lf-kind]'),o=q('[data-lf-out]'),w=q('[data-lf-when]');
    if(k){S.kind=k.dataset.lfKind;render();return;} if(o){S.out=o.dataset.lfOut;if(S.out==='Will call back'&&S.when==null)S.when=r5(NOW+2);render();return;} if(w){S.when=+w.dataset.lfWhen;render();return;}
    if(q('[data-lf-go]')){submitLog(lf.dataset.lf);return;} return;}
  const pk=q('[data-pick-i]');if(pk&&POP){popPick(+pk.dataset.pickI);return;}
  let closed=false;if(POP&&!q('.nx-pop')){POP=null;closed=true;}
  const a=q('[data-act]');if(a){KB=false;act(a.dataset.act);return;}
  const pp=q('[data-pop]');if(pp){openPop(pp.dataset.pop,pp.dataset.no||SEL);return;}
  const wk=q('[data-wake]');if(wk){snap();const no=wk.dataset.wake;BACK[no]={at:SNZ[no].at,why:SNZ[no].why};delete SNZ[no];SEL=no;toast('Back in the list');render();return;}
  const op=q('[data-open]');if(op){OPEN[op.dataset.open]=!OPEN[op.dataset.open];render();if(op.dataset.open==='clr'&&OPEN.clr){const s=$('.i3-scroll'),c=$('.nx-sec[data-open="clr"]',s);if(s&&c)s.scrollTop=c.offsetTop-60;}return;}
  if(q('[data-nundo]')){undo();return;}
  const s=q('[data-sel]');if(s&&!q('.px-btn')&&!MOVE){SEL=s.dataset.sel;KB=false;if(s.hasAttribute('data-pick')){SRCH=false;QV='';}TOAST='';render();return;}
  if(closed)render();});
mock.addEventListener('input',e=>{if(e.target.matches('.tg-srch input')){QV=e.target.value;$('.sr-pop').innerHTML=srPop();}
  if(e.target.matches('[data-lf-note]')){const sc=e.target.closest('[data-lf]').dataset.lf;(sc==='p'?LFP:LFC).note=e.target.value;}});
mock.addEventListener('mouseover',e=>{const it=e.target.closest('.i3-it');$$('.yd .i2-s.hl').forEach(x=>x.classList.remove('hl'));if(it&&TAB==='yard'){const sp=$(`.yd [data-at="${it.dataset.spot}"]`);if(sp)sp.classList.add('hl');}});
function move(d){const L=flat();if(!L.length)return;KB=true;const i=L.indexOf(SEL);SEL=i<0?L[d>0?0:L.length-1]:L[Math.max(0,Math.min(L.length-1,i+d))];render();}
addEventListener('keydown',e=>{const k=e.key,inF=e.target.matches('input,textarea');
  if(HELP){if(k==='Escape'||k==='?'){HELP=false;render();}return;}
  if(k==='Escape'){if(POP){POP=null;render();}else if(SRCH){SRCH=false;QV='';render();}else if(MOVE){MOVE=false;render();}else if(inF)e.target.blur();return;}
  if(k==='Enter'&&SRCH){const it=$('.sr-pop .it.k[data-sel]');if(it){SEL=it.dataset.sel;SRCH=false;QV='';render();}return;}
  if(POP){if(POP.type==='log'){if(k==='Enter'&&!e.shiftKey){e.preventDefault();submitLog('p');return;}if(inF)return;const n=+k;if(n>=1&&n<=6){LFP.out=OUTS[n-1];if(LFP.out==='Will call back'&&LFP.when==null)LFP.when=r5(NOW+2);render();return;}if(k==='n'){e.preventDefault();$('.nx-pop [data-lf-note]').focus();}return;}
    const N=popN();if(k==='ArrowDown'||k==='j'){e.preventDefault();POP.i=(POP.i+1)%N;render();return;}if(k==='ArrowUp'||k==='k'){e.preventDefault();POP.i=(POP.i-1+N)%N;render();return;}
    if(k==='Enter'){e.preventDefault();popPick(POP.i);return;}const n=+k;if(n>=1&&n<=N){popPick(n-1);return;}return;}
  if(inF){if(k==='Enter'&&!e.shiftKey&&e.target.matches('[data-lf-note]')){e.preventDefault();submitLog('c');}return;}
  if((e.ctrlKey||e.metaKey)&&(k==='z'||k==='Z')){e.preventDefault();undo();return;}
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(k==='j'||k==='ArrowDown'){e.preventDefault();move(1);return;}
  if(k==='k'||k==='ArrowUp'){e.preventDefault();move(-1);return;}
  if(k==='Enter'){e.preventDefault();KB=true;act(SEL);return;}
  if(k==='s'){KB=true;openPop('snooze',SEL);return;}
  if(k==='c'){KB=true;openPop('log',SEL);return;}
  if(k==='t'){KB=true;openPop('xfer',SEL);return;}
  if(k==='?'){HELP=true;render();return;}
  if(k==='/'){e.preventDefault();SRCH=true;QV='';render();return;}
  const n=+k;if(n>=1&&n<=3)setTab(VIEWS[n-1][0]);});

/* =================== customer contact layer =================== */
const SHOP={name:'Vanguard Truck Center – Greensboro',phone:'(336) 555-0100',me:'Dana'};
const PEOPLE={
 'Yadkin Valley Logistics':[{n:'Carla Jenkins',r:'Fleet manager',ph:'(336) 555-0142',em:'cjenkins@yadkinvl.com',pref:'Call',best:'before 11',ok:true},{n:'Marcus Reed',r:'Driver',ph:'(336) 555-0178',pref:'Text'}],
 'Sandhills Grain':[{n:'Bill Tate',r:'Owner',ph:'(910) 555-0123',pref:'Call',ok:true},{n:'Jorge Diaz',r:'Fleet manager',ph:'(910) 555-0166',em:'jdiaz@sandhillsgrain.com',pref:'Email'}],
 'Rowan Ready Mix':[{n:'Priya Shah',r:'Fleet manager',ph:'(704) 555-0190',em:'priya@rowanreadymix.com',pref:'Email',ok:true},{n:'Dale Hughes',r:'Driver',ph:'(704) 555-0134',pref:'Text'}],
 'Blue Ridge Haulage':[{n:'Tom Hale',r:'Fleet manager',ph:'(828) 555-0107',em:'thale@blueridgehaul.com',pref:'Call',best:'after 2',ok:true},{n:'Ricky Lane',r:'Driver',ph:'(828) 555-0155',pref:'Text'}],
 'Pilot Mountain Express':[{n:'Amy Carter',r:'Owner',ph:'(336) 555-0120',em:'amy@pilotmtnexpress.com',pref:'Email',ok:true},{n:'Wes Carter',r:'Driver',ph:'(336) 555-0119',pref:'Text'}],
 'Uwharrie Fuel':[{n:'Jan Price',r:'Office manager',ph:'(704) 555-0181',em:'office@uwharriefuel.com',pref:'Call',ok:true}],
 'Lexington Bottling':[{n:'Ed Morales',r:'Fleet manager',ph:'(336) 555-0163',pref:'Call',ok:true}],
 'Haw River Dairy':[{n:'Gail Moore',r:'Owner',ph:'(336) 555-0111',pref:'Call',ok:true},{n:'Josh Moore',r:'Driver',ph:'(336) 555-0112',pref:'Text'}],
};
const CTO={'37590':['Marcus Reed','Marcus Reed','Marcus Reed'],'37516':['Bill Tate'],'37628':['Priya Shah'],'37538':['Tom Hale','Tom Hale'],'37489':['Wes Carter'],'37301':['Jan Price','Jan Price'],'37460':['Ed Morales'],'37555':['Josh Moore']};
const APR0={'37538:0':{who:'Tom Hale',role:'Fleet manager',how:'Decisiv',at:'Tue 14:10',by:'Dana Kowalski',po:'BRH-20931'},
 '37489:0':{who:'Amy Carter',role:'Owner',how:'Email',at:'Tue 11:05',by:'Dana Kowalski',po:'PME-5521'},'37489:1':{who:'Amy Carter',role:'Owner',how:'Email',at:'Tue 11:05',by:'Dana Kowalski',po:'PME-5521'},
 '37460:0':{who:'Ed Morales',role:'Fleet manager',how:'Call',at:'Wed 16:20',by:'Dana Kowalski'},'37460:1':{who:'Ed Morales',role:'Fleet manager',how:'Call',at:'8:00',by:'Dana Kowalski',dec:true,reason:'Too expensive — release as is'},
 '37602:0':{who:'Sam Ortiz',role:'Fleet manager',how:'Call',at:'Mon 9:12',by:'Dana Kowalski'},'37602:1':{who:'Sam Ortiz',role:'Fleet manager',how:'Call',at:'Mon 9:12',by:'Dana Kowalski'}};
let APR=JSON.parse(JSON.stringify(APR0));
let TPL=[
 {id:'est',n:'Estimate',b:'Hi {first}, it’s {me} at {shop}. Estimate for unit {unit} (RO {ro}): {ops}. Total {total}. Reply YES to approve, or call me at {phone}.'},
 {id:'rem',n:'Approval reminder',b:'Hi {first}, checking in on the {total} estimate for unit {unit}. The truck is parked in {spot} until we hear back. Reply YES or call me at {phone}.'},
 {id:'par',n:'Parts delayed',b:'Hi {first}, parts for unit {unit} are now due {due}. We’ll start the moment they land and keep you posted. RO {ro}.'},
 {id:'rdy',n:'Ready for pickup',b:'Hi {first}, unit {unit} is ready. It’s parked in {spot} and the keys are at the service desk. RO {ro}.'}];
const TPL0=JSON.stringify(TPL);let TMCARET=null;
const TOK=['first','me','shop','unit','ro','ops','total','spot','due','ready','phone'];
const HOW=['Call','Text','Email','In person','Decisiv'];
const PAST={Call:'called',Text:'texted',Email:'emailed','In person':'given in person'};
let AP=null, TPLED=null, FLASH='', ADDP=false;
const ini=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
function pplOf(r){if(!PEOPLE[r.cust]){const F=['Alan Brooks','Lisa Grant','Keith Moore','Dee Walker','Ray Fox','Nina Cole'],Dr=['Chris Hall','Tony Webb','Sam Price','Lee Ford'];let h=0;for(const c of r.cust)h=(h*31+c.charCodeAt(0))%997;
  PEOPLE[r.cust]=[{n:F[h%F.length],r:'Fleet manager',ph:`(336) 555-0${String(h%900+100)}`,pref:'Call',ok:true},{n:Dr[h%Dr.length],r:'Driver',ph:`(336) 555-0${String((h*7)%900+100)}`,pref:'Text'}];}return PEOPLE[r.cust];}
const toOf=(r,c,i)=>c[5]||(CTO[r.no]||[])[i]||'';
function missed(r){const ap=(pplOf(r).find(p=>p.ok)||{}).n;const m={};r.ct.forEach((c,i)=>{const t=toOf(r,c,i);if(t&&t!==ap&&/No answer|Left voicemail/.test(c[3]))m[t]=(m[t]||0)+1;});return m;}
function defTo(r){const L=pplOf(r);const i=L.findIndex(p=>p.ok);return i<0?0:i;}
function toHint(r){const m=missed(r),ap=pplOf(r)[defTo(r)];const k=Object.keys(m).find(n=>m[n]>=2);return k?`${m[k]} calls to ${k.split(' ')[0]} went unanswered — ${ap.n.split(' ')[0]} approves estimates`:'';}
const openOps=r=>r.ops.map((o,i)=>[o,i]).filter(([o])=>o[2]===null);
function suggestTpl(r){if(r.cat==='rdy')return 'rdy';if(r.st==='parts')return 'par';if(r.ops.some(o=>o[2]===null))return r.ct.some(c=>/estimate/i.test(c[4]||''))?'rem':'est';return 'rdy';}
const tplBody=id=>(TPL.find(t=>t.id===id)||{b:''}).b;
function tmap(r,p){const a=appr(r),open=openOps(r).map(x=>x[0]);return {first:p?p.n.split(' ')[0]:'there',me:SHOP.me,shop:SHOP.name,unit:r.unit,ro:r.no,total:money(a.op||a.ok),ops:(open.length?open:r.ops.filter(o=>o[1])).map(o=>`${o[0].split(' – ')[0].toLowerCase()} ${money(o[1])}`).join(', '),spot:r.spot,phone:SHOP.phone,due:((r.sub||'').match(/due (\w+)/)||[,'later this week'])[1],ready:r.ready};}
const fill=(t,r,p)=>{const m=tmap(r,p);return t.replace(/\{(\w+)\}/g,(x,k)=>m[k]!=null?m[k]:x);};
function fillHtml(t,r,p){const m=tmap(r,p);return t.split(/(\{\w+\})/).map(s=>{const k=(s.match(/^\{(\w+)\}$/)||[])[1];return k&&m[k]!=null?`<mark>${esc(m[k])}</mark>`:esc(s);}).join('');}
const msgOf=(S,r,p)=>S.edit&&S.msg!=null?S.msg:fill(tplBody(S.tpl),r,p);
function copyText(t){const fb=()=>{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}ta.remove();};try{navigator.clipboard.writeText(t).catch(fb);}catch(e){fb();}}
function panelSum(S,r){const open=openOps(r);let n=0,sum=0;open.forEach(([o],j)=>{if(!S.ops||S.ops[j]){n++;sum+=o[1];}});return {n,sum,open};}

/* needs: an in-repair RO with an op still waiting on approval is waiting on the customer too */
needs=(orig=>function(){const L=orig();ROS.forEach(r=>{if(r.cat==='wrk'&&!L.some(x=>x[0]===r)){const op=openOps(r);if(op.length){const c=r.ct[r.ct.length-1];L.push([r,2,'phone',`Op ${op.map(x=>x[1]+1).join(', ')} · ${money(op.reduce((s,x)=>s+x[0][1],0))} waiting on approval${c?' · '+c[3].toLowerCase():''}`,'Follow up','Waiting on customers']);}}});return L.sort((a,b)=>a[1]-b[1]);})(needs);

/* ---------- 1 + 2 + 3 · the log form ---------- */
function follow(S,r){if(!S.out)return ['','Pick an outcome'];
  if(S.out==='Approved'||S.out==='Declined'){const s=panelSum(S,r);if(!s.open.length)return ['','Logs it on the RO'];const left=s.open.length-s.n-(S.out==='Approved'&&S.rest?s.open.length-s.n:0);
    if(S.out==='Approved')return s.n||S.rest?['ok',left?`${left} op${left>1?'s':''} stay open`:`Back to ${TECH[r.tech]||'the tech'} — clears the item`]:['','Tick what they approved'];
    return ['no',left?`${left} op${left>1?'s':''} stay open`:(r.ops.some(o=>o[2]==='ok')?`Back to ${TECH[r.tech]||'the tech'} for the rest`:'Moves to Ready to release')];}
  if(!itemOf(r.no))return ['','Logs it on the RO'];
  if(S.out==='Will call back')return ['snz',`Back in the list at ${fmt(S.when)}`];
  const h=FOLLOW[S.out];return ['snz',`Back in the list at ${fmt(r5(NOW+h))} · ${h} h`];}
function apPanel(S,r,p){if(S.out!=='Approved'&&S.out!=='Declined')return '';const open=openOps(r),ok=S.out==='Approved';
  if(!open.length)return `<div class="cx-ap"><div class="h">No open operations<small>nothing to ${ok?'approve':'decline'}</small></div></div>`;
  if(!S.ops||S.ops.length!==open.length)S.ops=open.map(()=>true);const s=panelSum(S,r),tot=open.reduce((a,x)=>a+x[0][1],0);
  return `<div class="cx-ap"><div class="h">${ok?I.check:I.x}${ok?'Approve':'Decline'}<small>${money(s.sum)} of ${money(tot)} open</small></div>
   ${open.map(([o,i],j)=>`<label class="cx-op${S.ops[j]?'':' off'}"><input type="checkbox" data-lf-op="${j}"${S.ops[j]?' checked':''}><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${money(o[1])}</span></label>`).join('')}
   ${ok&&s.n<open.length?`<label class="cx-rest"><input type="checkbox" data-lf-rest${S.rest?' checked':''}>Decline the rest</label>`:''}
   ${ok?`<div class="cx-f"><span>PO #</span><input class="px-input" data-lf-po value="${esc(S.po||'')}" placeholder="optional"></div>`:''}
   <div class="cx-rec">${I.check}<span>Saved on each op as ${ok?'approved':'declined'} by <b>${esc(p.n)}</b> · ${S.kind} · ${fmt(NOW)}</span></div></div>`;}
function btnLabel(S,r){const txt=(S.kind==='Text'||S.kind==='Email')&&S.tpl;if(S.out==='Approved'||S.out==='Declined'){const s=panelSum(S,r);if(s.open.length&&s.n)return `Log &amp; ${S.out==='Approved'?'approve':'decline'} ${money(s.sum)}`;}return txt?'Copy &amp; log':'Log it';}
function logForm(S,sc,r){const ppl=pplOf(r);if(S.to==null||!ppl[S.to])S.to=defTo(r);const p=ppl[S.to];
  const txt=S.kind==='Text'||S.kind==='Email';if(txt&&S.tpl===undefined)S.tpl=suggestTpl(r);if(txt&&S.tpl&&!S.out)S.out='Update given';
  const f=follow(S,r),ic=f[0]==='snz'?I.clock:f[0]==='ok'?I.check:f[0]==='no'?I.x:'',L=t=>`<span class="lbl">${t}</span>`;
  const chips=ppl.map((q,i)=>`<button class="cx-chip${S.to===i?' on':''}" data-lf-to="${i}"><span class="px-av">${ini(q.n)}</span><b>${esc(q.n)}</b><small>${esc(q.r)}${q.ok?' · approves':''}</small></button>`).join('');
  const addr=S.kind==='Email'?(p.em||''):p.ph;
  const det=`<div class="cx-det">${S.kind==='Email'?I.mail:I.phone}<span class="px-id">${addr?esc(addr):'No email on file'}</span><span>prefers ${p.pref.toLowerCase()}${p.best?' · best '+p.best:''}</span>${addr?`<button class="px-link" data-copy="${esc(addr)}">Copy</button>`:''}</div>`;
  const hint=toHint(r),hintH=hint&&S.kind==='Call'&&S.to===defTo(r)?`<div class="cx-hint">${I.flag}${esc(hint)}</div>`:'';
  const kinds=['Call','Text','Email','In person'].map(k=>`<button class="tg-chip${S.kind===k?' on':''}" data-lf-kind="${k}">${I[KIND[k]]}${k}</button>`).join('');
  let tpl='';if(txt){const sug=suggestTpl(r),m=S.tpl?msgOf(S,r,p):'';tpl=`<div class="lf-r cx-tpls">${L('Template')}${TPL.map(t=>`<button class="tg-chip${S.tpl===t.id?' on':''}" data-lf-tpl="${t.id}" title="${t.id===sug?'Suggested for this RO':''}">${esc(t.n)}${t.id===sug?'<i class="sug"></i>':''}</button>`).join('')}<button class="tg-chip${S.tpl?'':' on'}" data-lf-tpl="">None</button><button class="px-link cx-edit" data-tpled>Edit…</button></div>${S.tpl?`<div class="cx-msg">${S.edit?`<textarea data-lf-msg rows="5">${esc(m)}</textarea>`:`<div class="pv" data-lf-editmsg title="Click to edit">${fillHtml(tplBody(S.tpl),r,p)}</div>`}<div class="ft"><span>${m.length} characters</span><span>${S.edit?'Edited for this message':'Filled from the RO · click to edit'}</span></div></div>`:''}`;}
  const outs=OUTS.map((k,i)=>`<button class="tg-chip${S.out===k?' on':''}" data-lf-out="${k}">${sc==='p'?`<span class="px-kbd">${i+1}</span>`:''}${k}</button>`).join('');
  const when=S.out==='Will call back'&&itemOf(r.no)?`<div class="lf-r lf-when">${L(sc==='p'?'When did they say?':'When')}${whenOpts().map(([l,h])=>`<button class="tg-chip${S.when===h?' on':''}" data-lf-when="${h}" title="${l}">${fmt(h)}</button>`).join('')}</div>`:'';
  const noteOn=!(txt&&S.tpl);
  const ta=noteOn?`<textarea rows="1" data-lf-note placeholder="Note — e.g. asked for a yes or no on the brakes">${esc(S.note)}</textarea>`:'<span style="flex:1"></span>';
  const go=`<button class="px-btn px-btn--primary px-btn--sm" data-lf-go${S.out?'':' disabled'}>${txt&&S.tpl&&!/approve|decline/.test(btnLabel(S,r))?I.copy:''}${btnLabel(S,r)}<span class="px-kbd">↵</span></button>`;
  const fu=`<span class="lf-fu ${f[0]}">${ic}<span>${f[1]}</span></span>`;
  if(sc==='p')return `<div class="lf" data-lf="p"><div class="lf-r cx-to">${L('To')}${chips}</div>${det}${hintH}<div class="lf-r">${L('Log')}${kinds}</div>${tpl}<div class="lf-r">${L('Outcome')}${outs}</div>${apPanel(S,r,p)}${when}${noteOn?ta:''}<div class="lf-r lf-f">${fu}${go}</div><div class="lf-hint"><span><span class="px-kbd">1</span>–<span class="px-kbd">6</span> outcome</span><span><span class="px-kbd">N</span> note</span><span><span class="px-kbd">Esc</span> close</span></div></div>`;
  return `<div class="lf" data-lf="c"><div class="lf-r">${L('To')}${chips}<span style="width:14px"></span>${L('Log')}${kinds}</div>${tpl}<div class="lf-r">${L('Outcome')}${outs}</div>${apPanel(S,r,p)}${when}<div class="lf-r lf-nf">${ta}${fu}${go}</div></div>`;}
function settle(r){if(r.cat!=='apr'||r.ops.some(o=>o[2]===null))return;
  if(r.ops.some(o=>o[2]==='ok'||o[2]==='part'))Object.assign(r,{cat:'wrk',st:'hold',stn:'Hold tech',sub:'',late:false,next:'',stage:3,hold:['tech',TECH[r.tech]||'Technician',0,8]});
  else Object.assign(r,{cat:'rdy',st:'declined',stn:'Declined',sub:'',late:false,next:'',stage:6,age:'0m',hold:['writer','Dana Kowalski',0,2]});}
function applyLog(S,no){const r=get(no),inList=!!itemOf(no),ppl=pplOf(r),p=ppl[S.to==null?defTo(r):S.to]||ppl[0];snap();delete BACK[no];
  const txt=(S.kind==='Text'||S.kind==='Email')&&S.tpl;let note=(S.note||'').trim(),msg='';if(txt){msg=msgOf(S,r,p);note=msg;copyText(msg);}
  const ev=KIND[S.kind]==='chat'?'text':KIND[S.kind]==='mail'?'email':KIND[S.kind]==='user'?'person':'call';
  if((S.out==='Approved'||S.out==='Declined')&&openOps(r).length){const ok=S.out==='Approved',open=openOps(r);let a=0,d=0,ia=[],id=[];
    open.forEach(([o,i],j)=>{const t=!S.ops||S.ops[j],rec={who:p.n,role:p.r,how:S.kind,at:fmt(NOW),by:'Dana Kowalski',po:ok?(S.po||''):''};
      if(ok&&t){o[2]='ok';a+=o[1];ia.push(i+1);APR[`${no}:${i}`]=rec;}else if((ok&&S.rest)||(!ok&&t)){o[2]='no';d+=o[1];id.push(i+1);APR[`${no}:${i}`]={...rec,dec:true,po:''};}});
    const parts=[ia.length?`Approved op ${ia.join(', ')} · ${money(a)}${S.po?' · PO '+S.po:''}`:'',id.length?`Declined op ${id.join(', ')} · ${money(d)}`:''].filter(Boolean).join(' — ');
    r.ct.push([S.kind,fmt(NOW),'Dana Kowalski',ia.length?'Approved':'Declined',[note,parts].filter(Boolean).join('\n'),p.n]);r.ev.push([NOW,ev]);
    settle(r);if(inList&&!itemOf(no))clr(ia.length?'check':'x',ia.length?`Approved ${money(a)}`:'Logged decline',r);
    toast(`${ia.length?'Approved '+money(a):'Declined '+money(d)}${ia.length&&id.length?' · declined '+money(d):''} · ${p.n} · ${S.kind}`);return;}
  r.ct.push([S.kind,fmt(NOW),'Dana Kowalski',S.out,note,p.n]);r.ev.push([NOW,ev]);
  let until=null;if(inList&&S.out!=='Approved'&&S.out!=='Declined'){until=S.out==='Will call back'?S.when:r5(NOW+FOLLOW[S.out]);SNZ[no]={until,why:S.out==='Will call back'?'Said they’d call back':S.out,at:NOW};}
  toast(txt?`Copied — paste it into your ${S.kind==='Email'?'email':'phone'}. Logged as a ${S.kind.toLowerCase()} to ${p.n.split(' ')[0]}${until?', back '+fmt(until):''}.`:until?`${r.cust} snoozed until ${fmt(until)}`:`${S.kind} logged on RO-${r.no}`);}

/* ---------- 4 · approval record ---------- */
function recLine(r,o,i){const a=APR[`${r.no}:${i}`];
  if(o[2]==='warr')return `<div class="cx-rl">${I.warranty}Warranty — no customer approval needed</div>`;
  if(o[2]===null){const c=r.ct.slice().reverse().find(c=>/estimate|\$/i.test(c[4]||''));return `<div class="cx-rl">Open${c?` · estimate ${PAST[c[0]]||'sent'} ${c[1]}`:''}</div>`;}
  if(!a)return `<div class="cx-rl warn">${I.flag}No record of who ${o[2]==='no'?'declined':'approved'} this — <button data-aprrec="${i}">Add</button></div>`;
  return `<div class="cx-rl ${a.dec?'no':'ok'}">${a.dec?I.x:I.check}<b>${esc(a.who)}</b>${a.role?` · ${esc(a.role)}`:''} · ${esc(a.how)} · ${esc(a.at)}${a.po?` · PO <span class="px-id">${esc(a.po)}</span>`:''}${a.amt?` · ${money(a.amt)} of ${money(o[1])}`:''}${a.reason?` · “${esc(a.reason)}”`:''}<span class="by">logged by ${esc(a.by.split(' ')[0])}</span></div>`;}
function recordText(r){const L=[`RO ${r.no} · ${r.cust} · unit ${r.unit}`];r.ops.forEach((o,i)=>{const a=APR[`${r.no}:${i}`];L.push(`Op ${i+1} ${o[0]} ${o[1]?money(o[1]):''} — `+(o[2]==='warr'?'warranty':o[2]===null?'open':a?`${a.dec?'declined':o[2]==='part'?'partly approved':'approved'} by ${a.who}${a.role?' ('+a.role+')':''} via ${a.how}, ${a.at}${a.po?', PO '+a.po:''}${a.amt?', '+money(a.amt):''}${a.reason?', "'+a.reason+'"':''}; logged by ${a.by}`:`${o[2]==='no'?'declined':'approved'} — no record`));});return L.join('\n');}
const newAP=r=>({to:defTo(r),how:'Call',po:'',amt:'',reason:''});
function openAppr(no,op,dec,recOnly){const r=get(no);SEL=no;AP=newAP(r);const a=APR[`${no}:${op}`];if(a){const k=pplOf(r).findIndex(p=>p.n===a.who);if(k>=0)AP.to=k;AP.how=a.how;AP.po=a.po||'';AP.reason=a.reason||'';AP.amt=a.amt||'';}
  POP={type:'appr',no,op,dec,rec:!!recOnly,i:0};render();}
function apprPop(){const r=get(POP.no);if(!r)return '';const o=r.ops[POP.op],ppl=pplOf(r),A=AP,d=POP.dec;
  return `<div class="ap-pop ap-in">${apprBody(r,o,ppl,A,d)}</div>`;}
function apprBody(r,o,ppl,A,d){
  const verb=POP.rec?'Record approval':d==='ok'?'Approve':d==='part'?'Partly approve':'Decline';
  return `<div class="nx-ph"><span class="k">${verb}</span><span class="tg-ro">Op ${POP.op+1}</span><b>${esc(o[0])}</b><span class="mny">${money(o[1])}</span><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>
   <div class="lbl">Who ${d==='no'?'declined':'approved'}</div><div class="lf-r">${ppl.map((q,i)=>`<button class="cx-chip${A.to===i?' on':''}" data-ap-to="${i}"><span class="px-av">${ini(q.n)}</span><b>${esc(q.n)}</b><small>${esc(q.r)}${q.ok?' · approves':''}</small></button>`).join('')}</div>
   <div class="lbl">How</div><div class="lf-r">${HOW.map((h,i)=>`<button class="tg-chip${A.how===h?' on':''}" data-ap-how="${h}"><span class="px-kbd">${i+1}</span>${h}</button>`).join('')}</div>
   ${d==='part'?`<div class="cx-f"><span>Approved amount</span><input class="px-input" data-ap-amt value="${esc(A.amt)}" placeholder="$ of ${money(o[1])}"></div>`:''}
   ${d!=='no'?`<div class="cx-f"><span>PO #</span><input class="px-input" data-ap-po value="${esc(A.po)}" placeholder="optional"></div>`:`<div class="cx-f"><span>Reason</span><input class="px-input" data-ap-reason value="${esc(A.reason)}" placeholder="optional — e.g. too expensive"></div>`}
   <div class="cx-rec">${I.check}<span>Saved with your name, <b>Dana Kowalski</b>, and the time · ${fmt(NOW)}</span></div>
   <div class="acts"><button class="px-btn px-btn--sm" data-close>Cancel<span class="px-kbd">Esc</span></button><button class="px-btn px-btn--primary px-btn--sm" data-ap-save>${POP.rec?'Save record':{ok:'Save approval',part:'Save partial approval',no:'Save decline'}[d]}<span class="px-kbd">↵</span></button></div>`;}
function saveAppr(){const {no,op,dec,rec}=POP,r=get(no),o=r.ops[op],p=pplOf(r)[AP.to],was=!!itemOf(no);snap();
  if(!rec)o[2]=dec;APR[`${no}:${op}`]={who:p.n,role:p.r,how:AP.how,at:fmt(NOW),by:'Dana Kowalski',po:dec==='no'?'':AP.po.trim(),amt:dec==='part'?(+String(AP.amt).replace(/[^\d.]/g,'')||0):0,dec:dec==='no',reason:dec==='no'?AP.reason.trim():''};
  settle(r);if(was&&!itemOf(no))clr(dec==='no'?'x':'check',dec==='no'?'Logged decline':`Approved op ${op+1}`,r);
  POP=null;toast(`${rec?'Record saved':dec==='no'?'Declined':'Approved'} · op ${op+1} · ${p.n} · ${AP.how}`);render();}

/* ---------- Inbox view: who to call strip + thread + approvals with records ---------- */
function vInbox(r){const a=appr(r),ppl=pplOf(r),dt=defTo(r),hint=toHint(r);
  const thread=r.ct.map((c,i)=>{const t=toOf(r,c,i);return `<div class="i3-m"><span class="gi">${I[KIND[c[0]]]}</span><div class="bd"><div class="hd"><b>${esc(c[0])}</b>${t?`<span class="to">${esc(t)}</span>`:''}<span class="tg-oc ${OUTC(c[3])}">${esc(c[3])}</span><span style="color:var(--ink-3)">${esc(c[2])}</span><time>${esc(c[1])}</time></div>${c[4]?`<p>${esc(c[4])}</p>`:''}</div></div>`;}).join('');
  const sz=SNZ[r.no]?`<div class="i3-m sys"><span class="gi">${I.clock}</span><div class="bd"><div class="hd">Snoozed until <b style="color:var(--ink)">${fmt(SNZ[r.no].until)}</b>${SNZ[r.no].why?' · '+esc(SNZ[r.no].why):''}<time>${fmt(SNZ[r.no].at)}</time></div></div></div>`:'';
  const pc=ppl.map((p,i)=>{const k=p.pref==='Text'?['chat','Text']:p.pref==='Email'?['mail','Email']:['phone','Call'];return `<div class="cx-pc${i===dt&&hint?' sug':''}"><span class="px-av px-av--md">${ini(p.n)}</span><div class="nm"><b>${esc(p.n)}<span class="rl">${esc(p.r)}</span>${p.ok?'<span class="cx-tag">Approves</span>':''}</b><small><span class="px-id">${esc(p.ph)}</span> · prefers ${p.pref.toLowerCase()}${p.best?' · '+p.best:''}</small></div><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-copy="${esc(p.ph)}" title="Copy number">${I.copy}</button><button class="px-btn px-btn--sm" data-callp="${i}" data-kind="${k[1]==='Call'?'Call':k[1]}">${I[k[0]]}${k[1]}</button></div>`;}).join('');
  const addf=ADDP?`<div class="cx-addf"><input class="px-input" data-np="n" placeholder="Name" style="width:160px"><select class="px-input" data-np="r" style="width:140px"><option>Fleet manager</option><option>Driver</option><option>Owner</option><option>Office manager</option></select><input class="px-input" data-np="ph" placeholder="(336) 555-0100" style="width:150px"><label style="font-size:12.5px;color:var(--ink-2);display:flex;gap:6px;align-items:center"><input type="checkbox" data-np="ok">Approves</label><button class="px-btn px-btn--sm px-btn--primary" data-np-save>Add</button><button class="px-btn px-btn--sm px-btn--ghost" data-np-cancel>Cancel</button></div>`:'';
  const card=`<div class="i3-appr cx-card"><div class="h">${I.check}Approvals<span>Approved ${money(a.ok)} · open ${money(a.op)}${a.no?' · declined '+money(a.no):''}</span><button class="px-btn px-btn--sm" data-copyrec title="For the Decisiv case notes">${I.copy}Copy record</button></div>${r.ops.map((o,i)=>`<div class="i3-op" data-op="${i}"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}" data-apr="${i}" data-dec="ok">Approve</button><button class="${o[2]==='part'?'on part':''}" data-apr="${i}" data-dec="part">Partly</button><button class="${o[2]==='no'?'on no':''}" data-apr="${i}" data-dec="no">Decline</button></span>`}${POP&&POP.type==='appr'&&POP.no===r.no&&POP.op===i?apprPop():recLine(r,o,i)}</div>`).join('')}</div>`;
  return `<div class="i3-main"><div class="i3-top"><div class="r1"><span class="tg-ro">RO-${r.no}</span>${sq(r.cat)}<span>${CAT[r.cat][0]}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2>
   <div class="r2">${spot(r.spot)}${ticks(r)}<span style="display:inline-flex;gap:6px;align-items:center">${st(r)}</span>${held(r)}<span style="margin-left:auto;display:flex;gap:8px"><button class="px-btn px-btn--sm" data-pop="xfer" data-no="${r.no}">${I.swap}Transfer…</button><button class="px-btn px-btn--sm">Open RO</button></span></div>
   <div class="cx-ppl${FLASH==='ppl'?' flash':''}">${pc}<button class="cx-add" data-np-open>${I.plus}Add</button>${hint?`<div class="cx-hint">${I.flag}${esc(hint)}</div>`:''}${addf}</div></div>
   <div class="i3-thread"><span class="i3-day">This RO · calls, texts, approvals and transfers</span>${thread||'<div class="i3-m sys"><span class="gi">'+I.phone+'</span><div class="bd"><div class="hd">No contact logged yet</div></div></div>'}${sz}
    ${xferRows(r)}
    ${card}</div>
   <div class="i3-comp">${logForm(LFC,'c',r)}</div></div>`;}

/* ---------- template editor ---------- */
function tplModal(){const t=TPL.find(x=>x.id===TPLED)||TPL[0],r=get(SEL),p=pplOf(r)[defTo(r)];
  return `<div class="px-scrim cx-tm" data-tm-scrim><div class="px-modal"><div class="px-modal__h"><div><h2>Text templates</h2><p>Shared by everyone on Triage. Words in braces fill in from the RO.</p></div><button class="px-btn px-btn--icon px-btn--ghost" data-tm-close aria-label="Close">${I.x}</button></div>
   <div class="px-modal__b"><div class="cx-tmg"><div class="cx-tml">${TPL.map(x=>`<button class="px-menu__item${x.id===t.id?' is-on':''}" data-tm-sel="${x.id}">${esc(x.n)}</button>`).join('')}<div class="px-menu__sep"></div><button class="px-menu__item" data-tm-new>${I.plus}New template</button></div>
   <div class="cx-tmr"><input class="px-input" data-tm-name value="${esc(t.n)}"><textarea class="px-input cx-tmb" data-tm-body>${esc(t.b)}</textarea><div class="cx-tok">${TOK.map(k=>`<button class="tg-chip" data-tm-tok="${k}">{${k}}</button>`).join('')}</div><div class="tg-sec" style="margin:4px 0 -4px">Preview · RO-${r.no} · ${esc(p.n)}</div><div class="cx-msg"><div class="pv" data-tm-pv>${fillHtml(t.b,r,p)}</div></div></div></div></div>
   <div class="px-modal__f"><span class="px-modal__hint">Changes save as you type</span><button class="px-btn px-btn--primary" data-tm-close>Done</button></div></div></div>`;}

/* ---------- wiring ---------- */
popHtml=(orig=>function(){if(POP&&POP.type==='appr')return '';if(POP&&POP.type==='log'){const r=get(POP.no);if(!r)return '';return `<div class="nx-pop px-pop"><div class="nx-ph"><span class="k">Log a contact</span><span class="tg-ro">RO-${r.no}</span><b>${esc(r.cust)}</b><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>${logForm(LFP,'p',r)}</div>`;}return orig();})(popHtml);
render=(orig=>function(){orig();
  const ap=$('.ap-in'),th=$('.i3-thread');if(ap&&th){const a=ap.getBoundingClientRect(),t=th.getBoundingClientRect();if(a.bottom>t.bottom)th.scrollTop+=(a.bottom-t.bottom)/scale+16;else if(a.top<t.top)th.scrollTop-=(t.top-a.top)/scale+16;}
  $$('.i3-it').forEach(it=>{const r=get(it.dataset.sel),b=it.querySelector('[data-act]');if(r&&b&&/Call back|Follow up/.test(b.textContent)){const p=pplOf(r)[defTo(r)];b.title=`${p.n} · ${p.ph}`;}});
  if(TPLED){mock.insertAdjacentHTML('beforeend',tplModal());}
  if(FLASH){setTimeout(()=>{FLASH='';},1700);}
  $$('[data-demo]').forEach(b=>b.classList.toggle('is-on',b.dataset.demo===DEMO));})(render);
snap=function(){UNDO.push(JSON.stringify({ros:ROS,rel:D.rel,SNZ,BACK,CLR,SEL,APR}));if(UNDO.length>30)UNDO.shift();};
undo=function(){if(!UNDO.length)return;const s=JSON.parse(UNDO.pop());ROS.splice(0,ROS.length,...s.ros);D.rel.splice(0,D.rel.length,...s.rel);SNZ=s.SNZ;BACK=s.BACK;CLR=s.CLR;SEL=s.SEL;APR=s.APR||APR;POP=null;toast('Undone',false);render();};
reset=(orig=>function(){APR=JSON.parse(JSON.stringify(APR0));TPL=JSON.parse(TPL0);LFC=newLF();TPLED=null;ADDP=false;DEMO='';FLASH='';orig();})(reset);
$('[data-reset]').onclick=()=>reset();
let DEMO='';
function demo(k){reset();DEMO=k;TAB='inbox';KB=false;
  if(k==='out'){openPop('log','37590');LFP.out='Approved';LFP.po='YVL-7731';}
  if(k==='tpl'){openPop('log','37590');LFP.kind='Text';LFP.tpl='rem';}
  if(k==='who'){SEL='37590';FLASH='ppl';}
  if(k==='rec'){SEL='37538';render();openAppr('37538',1,'ok');return;}
  render();}
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));

mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s),stop=()=>{e.stopPropagation();e.preventDefault();};
  if(TPLED){if(q('[data-tm-close]')||(q('[data-tm-scrim]')&&!q('.px-modal'))){TPLED=null;render();return stop();}
    const sl=q('[data-tm-sel]');if(sl){TPLED=sl.dataset.tmSel;render();return stop();}
    if(q('[data-tm-new]')){const id='t'+Date.now();TPL.push({id,n:'New template',b:'Hi {first}, '});TPLED=id;render();return stop();}
    const tk=q('[data-tm-tok]');if(tk){const ta=$('[data-tm-body]'),v=`{${tk.dataset.tmTok}}`,s0=TMCARET==null?ta.value.length:TMCARET;ta.value=ta.value.slice(0,s0)+v+ta.value.slice(s0);TMCARET=s0+v.length;ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus();ta.selectionStart=ta.selectionEnd=s0+v.length;return stop();}
    e.stopPropagation();return;}
  if(q('[data-tpled]')){TMCARET=null;TPLED=(POP&&POP.type==='log'?LFP:LFC).tpl||TPL[0].id;render();return stop();}
  const cp=q('[data-copy]');if(cp&&cp.dataset.copy){copyText(cp.dataset.copy);toast(`Copied ${cp.dataset.copy}`,false);render();return stop();}
  if(q('[data-copyrec]')){copyText(recordText(get(SEL)));toast('Approval record copied — paste it into the Decisiv case notes',false);render();return stop();}
  const cl=q('[data-callp]');if(cl){openPop('log',SEL);LFP.to=+cl.dataset.callp;LFP.kind=cl.dataset.kind;render();return stop();}
  if(q('[data-np-open]')){ADDP=!ADDP;render();return stop();}
  if(q('[data-np-cancel]')){ADDP=false;render();return stop();}
  if(q('[data-np-save]')){const v=k=>$(`[data-np="${k}"]`);const n=v('n').value.trim();if(n){pplOf(get(SEL)).push({n,r:v('r').value,ph:v('ph').value.trim()||'—',pref:'Call',ok:v('ok').checked});toast(`${n} added to ${get(SEL).cust}`,false);}ADDP=false;render();return stop();}
  const ar=q('[data-apr]');if(ar){openAppr(SEL,+ar.dataset.apr,ar.dataset.dec);return stop();}
  const rc=q('[data-aprrec]');if(rc){const o=get(SEL).ops[+rc.dataset.aprrec];openAppr(SEL,+rc.dataset.aprrec,o[2]==='no'?'no':'ok',true);return stop();}
  if(q('.ap-pop')){const to=q('[data-ap-to]'),hw=q('[data-ap-how]');if(to){AP.to=+to.dataset.apTo;render();}else if(hw){AP.how=hw.dataset.apHow;render();}else if(q('[data-ap-save]'))saveAppr();else if(q('[data-close]')){POP=null;render();}e.stopPropagation();return;}
  const lf=q('[data-lf]');if(lf){const S=lf.dataset.lf==='p'?LFP:LFC;
    const to=q('[data-lf-to]');if(to){S.to=+to.dataset.lfTo;render();return stop();}
    const tp=q('[data-lf-tpl]');if(tp){S.tpl=tp.dataset.lfTpl||null;S.edit=false;S.msg=null;if(S.tpl&&!S.out)S.out='Update given';render();return stop();}
    if(q('[data-lf-editmsg]')){const r=get(lf.dataset.lf==='p'?POP.no:SEL);S.msg=msgOf(S,r,pplOf(r)[S.to]);S.edit=true;render();const ta=$(`[data-lf="${lf.dataset.lf}"] [data-lf-msg]`);if(ta){ta.focus();ta.selectionStart=ta.selectionEnd=ta.value.length;}return stop();}
    const kd=q('[data-lf-kind]');if(kd){S.kind=kd.dataset.lfKind;if((S.kind==='Text'||S.kind==='Email')&&S.tpl===undefined){}render();e.stopPropagation();return;}
    const oc=q('[data-lf-out]');if(oc){S.out=oc.dataset.lfOut;S.ops=null;S.rest=false;if(S.out==='Will call back'&&S.when==null)S.when=r5(NOW+2);render();e.stopPropagation();return;}
    if(q('label.cx-op,label.cx-rest'))e.stopPropagation();}
},true);
mock.addEventListener('focusout',e=>{if(e.target.matches('[data-tm-body]'))TMCARET=e.target.selectionStart;});
mock.addEventListener('change',e=>{const t=e.target;const lf=t.closest('[data-lf]');if(!lf)return;const S=lf.dataset.lf==='p'?LFP:LFC;
  if(t.matches('[data-lf-op]')){S.ops[+t.dataset.lfOp]=t.checked;render();}else if(t.matches('[data-lf-rest]')){S.rest=t.checked;render();}});
mock.addEventListener('input',e=>{const t=e.target,lf=t.closest('[data-lf]'),S=lf?(lf.dataset.lf==='p'?LFP:LFC):null;
  if(S&&t.matches('[data-lf-msg]')){S.msg=t.value;const c=t.closest('.cx-msg').querySelector('.ft span');if(c)c.textContent=t.value.length+' characters';}if(S&&t.matches('[data-lf-po]'))S.po=t.value;
  if(AP&&t.matches('[data-ap-po]'))AP.po=t.value;if(AP&&t.matches('[data-ap-amt]'))AP.amt=t.value;if(AP&&t.matches('[data-ap-reason]'))AP.reason=t.value;
  if(TPLED&&(t.matches('[data-tm-body]')||t.matches('[data-tm-name]'))){const tp=TPL.find(x=>x.id===TPLED);if(t.matches('[data-tm-body]'))tp.b=t.value;else{tp.n=t.value;const b=$(`[data-tm-sel="${TPLED}"]`);if(b)b.textContent=t.value;}const r=get(SEL),pv=$('[data-tm-pv]');if(pv)pv.innerHTML=fillHtml(tp.b,r,pplOf(r)[defTo(r)]);}});
addEventListener('keydown',e=>{const k=e.key,inF=e.target.matches('input,textarea,select');
  if(TPLED){if(k==='Escape'){TPLED=null;render();}e.stopPropagation();return;}
  if(POP&&POP.type==='appr'){if(k==='Escape'){POP=null;render();}else if(k==='Enter'){e.preventDefault();saveAppr();}else if(!inF){const n=+k;if(n>=1&&n<=5){AP.how=HOW[n-1];render();}}e.stopPropagation();return;}
},true);

/* =================== transfers and release layer =================== */
const XF0={'37011':[{at:'5:00',from:'Pat Sutton · Technician',to:'foreman',who:'Ray Owens',why:'Comeback',note:'Coolant loss again after the head gasket — needs a second look before we pull it apart.',back:7}],
 '34601':[{at:'Tue 14:20',from:'Mike Rodriguez · Technician',to:'parts',who:'Parts desk',why:'Parts to order',note:'DPF on backorder from the DC.',back:null}],
 '36988':[{at:'Wed 8:10',from:'Pat Sutton · Technician',to:'warranty',who:'Kim Lee',why:'Tech support case',note:'Case 4-118 open with Volvo.',back:32}],
 '37590':[{at:'Wed 8:05',from:'Luis Martinez · Technician',to:'writer',who:'Dana Kowalski',why:'Estimate ready',note:'',back:null}],
 '37555':[{at:'7:15',from:'Dana Kowalski · Approval',to:'foreman',who:'Ray Owens',why:'Needs a tech',note:'PM-A, driver waiting.',back:8.25}],
 '37538':[{at:'9:35',from:'Mike Rodriguez · Technician',to:'writer',who:'Dana Kowalski',why:'Needs customer approval',note:'Wheel seal found during the clutch job.',back:null}]};
let XF=JSON.parse(JSON.stringify(XF0)), RLS=null, XS=null;
const WHY={writer:['Needs customer approval','Estimate ready','Customer question'],tech:['Ready to work','Parts arrived','Approved — go ahead'],parts:['Parts to order','Wrong part','Core return'],foreman:['Second opinion','Comeback','Needs a tech'],warranty:['Claim to file','Tech support case','Policy question'],manager:['Over the goal','Customer complaint','Pricing call']};
const RSN=['Customer is at the counter','Paperwork to follow','Warranty claim pending','Manager OK’d it'];
const DESKS=['writer','tech','parts','foreman','warranty','manager'];
const dur=h=>h<1?Math.round(h*60)+'m':(h<10?h.toFixed(1):Math.round(h))+' h';
const lastX=r=>{const L=XF[r.no];return L&&L.length?L[L.length-1]:null;};
const atStr=a=>typeof a==='number'?fmt(a):a;
function tweak(){const r=get('34601');if(r)r.hold[2]=52;}
tweak();

/* Held too long = twice the desk's goal, or past the back-by time */
needs=(orig=>function(){const L=orig().filter(x=>x[5]!=='Held too long');ROS.forEach(r=>{if(r.cat==='arr'||L.some(x=>x[0]===r))return;const [role,who,h,g]=r.hold,lx=lastX(r),due=lx&&lx.back!=null&&lx.to===role&&NOW>lx.back+1e-6;
  if(h>=2*g||due)L.push([r,4,'swap',due?`Due back from ${who.split(' ')[0]} at ${fmt(lx.back)} · ${dur(NOW-lx.back)} late`:`With ${ROLE[role][1].toLowerCase()} ${dur(h)} · ${(h/g).toFixed(1)}× the ${g} h goal`,'Nudge','Held too long']);});return L.sort((a,b)=>a[1]-b[1]);})(needs);
tick=(orig=>function(h){ROS.forEach(r=>{r.hold[2]=+(r.hold[2]+h).toFixed(2);});orig(h);})(tick);

/* ---------- release with checks ---------- */
function relChecks(r){const [a,b,p,n,rt]=r.chk,hold=/^Waiting/.test(r.stn),dec=r.st==='declined';
  return [{k:'ops',ok:a===b,label:'All operations complete',detail:`${a} of ${b}`,fix:'Mark complete'},
   {k:'parts',ok:!!p,label:'Parts installed',detail:p?'all installed':'not all installed',fix:'Mark installed'},
   {k:'notes',ok:!!n,label:'Notes written',detail:n?(r.noteAdded?'note added '+r.noteAdded:'every punch has a note'):'1 punch with no note',fix:'Add note'},
   {k:'road',ok:!!rt,label:'Road test done',detail:rt?(r.road?`${r.road.res} · ${r.road.mi?r.road.mi+' mi · ':''}${r.road.at}`:dec?'not needed — declined':'Pass'):'not logged',fix:'Log road test'},
   {k:'hold',ok:!hold,label:'Nothing holding',detail:hold?r.stn.replace('Waiting – ','waiting on '):'clear',fix:null}];}
const newRLS=r=>{const L=pplOf(r);let i=L.findIndex(p=>p.r==='Driver');if(i<0)i=defTo(r);return {to:i,other:'',text:false,any:false,reason:'',note:'',fix:null,fixText:'',road:'Pass',mi:''};};
function relPop(r){const C=relChecks(r),bad=C.filter(c=>!c.ok),L=pplOf(r),A=RLS,p=A.to==='o'?{n:A.other||'someone else'}:L[A.to],C2=2*Math.PI*9,done=C.length-bad.length;
  const head=`<div class="nx-ph"><span class="k">Release</span><span class="tg-ro">RO-${r.no}</span><b>${esc(r.cust)}</b><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>`;
  const fixF=c=>c.k==='notes'?`<div class="rl-fix"><input class="px-input" data-rl-fixtext placeholder="What was done on ${esc(r.tech)}’s 2.3 h punch" value="${esc(A.fixText)}"><button class="px-btn px-btn--sm px-btn--primary" data-rl-save="notes">Save note</button></div>`
    :c.k==='road'?`<div class="rl-fix"><span class="lb">Result</span><span class="tg-seg3"><button class="${A.road==='Pass'?'on ok':''}" data-rl-road="Pass">Pass</button><button class="${A.road==='Fail'?'on no':''}" data-rl-road="Fail">Fail</button></span><input class="px-input" data-rl-mi placeholder="Miles" style="max-width:80px;min-width:0" value="${esc(A.mi)}"><button class="px-btn px-btn--sm px-btn--primary" data-rl-save="road">Save</button></div>`
    :`<div class="rl-fix"><span class="lb">${c.k==='ops'?'Marks every operation complete on the RO.':'Marks every part on the RO installed.'}</span><button class="px-btn px-btn--sm px-btn--primary" data-rl-save="${c.k}">${c.fix}</button></div>`;
  const cks=`<div class="rl-cks">${C.map(c=>`<div class="rl-ck ${c.ok?'ok':'no'}"><i></i><span>${c.label}</span><small>${esc(c.detail)}</small>${!c.ok&&c.fix&&A.fix!==c.k?`<button class="px-link" data-rl-fix="${c.k}">${c.fix}</button>`:''}</div>${A.fix===c.k&&!c.ok?fixF(c):''}`).join('')}</div>`;
  const ppl=`<span class="lbl top">Picked up by</span><div class="lf-r">${L.map((q,i)=>`<button class="cx-chip${A.to===i?' on':''}" data-rl-to="${i}"><span class="px-av">${ini(q.n)}</span><b>${esc(q.n)}</b><small>${esc(q.r)}</small></button>`).join('')}<button class="tg-chip${A.to==='o'?' on':''}" data-rl-to="o">Someone else</button></div>${A.to==='o'?`<input class="px-input xf-note" style="margin-top:6px" data-rl-other placeholder="Name" value="${esc(A.other)}">`:''}`;
  const line=`<div class="rl-line"><span class="it">${I.keyTag}Key tag <span class="px-id">1${r.no.slice(-2)}</span> to ${esc(p.n.split(' ')[0])}</span><span class="it">${I.pin}${r.spot} frees up</span><span class="it">${I.check}Moves to Released today</span></div>`;
  const tx=pplOf(r).some(q=>q.pref==='Text')?`<label class="rl-opt"><input type="checkbox" data-rl-text${A.text?' checked':''}>Copy the “Ready for pickup” text for ${esc(p.n.split(' ')[0])} too</label>`:'';
  const any=bad.length&&A.any?`<div class="rl-any"><span class="lbl">Release with ${bad.length} check${bad.length>1?'s':''} open — why?</span><div class="lf-r">${RSN.map(x=>`<button class="tg-chip${A.reason===x?' on':''}" data-rl-reason="${x}">${x}</button>`).join('')}</div><input class="px-input" data-rl-note placeholder="Note (optional)" value="${esc(A.note)}"></div>`:'';
  const acts=!bad.length?`<div class="acts"><span class="hint">All 5 checks pass</span><button class="px-btn px-btn--sm" data-close>Cancel<span class="px-kbd">Esc</span></button><button class="px-btn px-btn--primary px-btn--sm" data-rl-go="ok">${I.release}Release<span class="px-kbd">↵</span></button></div>`
    :A.any?`<div class="acts"><button class="px-btn px-btn--sm px-btn--ghost" data-rl-back>Back</button><button class="px-btn px-btn--sm" data-rl-go="any"${A.reason?'':' disabled'}>Release anyway<span class="px-kbd">↵</span></button></div>`
    :`<div class="acts"><span class="hint">Fix ${bad.length} to unlock</span><button class="px-btn px-btn--sm" data-rl-any>Release anyway…</button><button class="px-btn px-btn--primary px-btn--sm" disabled>${I.release}Release</button></div>`;
  return `<div class="nx-pop px-pop rl">${head}<div class="rl-sum${bad.length?' bad':''}"><svg class="tg-ring${bad.length?'':' ok'}" width="22" height="22" viewBox="0 0 22 22"><circle class="t" cx="11" cy="11" r="9" style="stroke-width:3"/><circle class="p" cx="11" cy="11" r="9" style="stroke-width:3" stroke-dasharray="${(C2*done/5).toFixed(1)} ${C2.toFixed(1)}"/></svg><b>Ready to close</b><small>${done} of 5${bad.length?' · '+bad.length+' open':''}</small></div>${cks}${ppl}${line}${tx}${any}${acts}</div>`;}
function relFix(k){const r=get(POP.no);snap();
  if(k==='notes'){if(!RLS.fixText.trim()){toast('Write what was done first',false);render();return;}r.chk[3]=true;r.noteAdded=fmt(NOW);}
  if(k==='road'){if(RLS.road==='Fail'){RLS.fix=null;toast('Road test failed — back to the tech; release stays locked',false);r.road={res:'Fail',mi:RLS.mi,at:fmt(NOW)};render();return;}r.chk[4]=true;r.road={res:'Pass',mi:RLS.mi,at:fmt(NOW)};}
  if(k==='ops')r.chk[0]=r.chk[1];if(k==='parts')r.chk[2]=true;
  RLS.fix=null;RLS.fixText='';toast(`${{notes:'Note added',road:'Road test logged',ops:'Operations marked complete',parts:'Parts marked installed'}[k]}`,true);render();}
function doRelease2(no,any){const r=get(no),bad=relChecks(r).filter(c=>!c.ok),L=pplOf(r),p=RLS.to==='o'?{n:RLS.other.trim()||'Walk-in'}:L[RLS.to],key='1'+no.slice(-2);snap();
  if(RLS.text){const q=L[RLS.to]||L[0];copyText(fill(tplBody('rdy'),r,q));}
  ROS.splice(ROS.indexOf(r),1);D.rel.push({no:r.no,cust:r.cust,at:fmt(NOW)+(any?' · released anyway':` · to ${p.n.split(' ')[0]}`),spot:r.spot,by:'Dana Kowalski',to:p.n,key,ov:any?{open:bad.map(c=>c.label),reason:RLS.reason,note:RLS.note}:null});
  delete BACK[no];CLR.push({at:NOW,ic:any?'flag':'release',what:any?'Released anyway':'Released',no:r.no,cust:r.cust});
  toast(any?`Released anyway — ${bad.map(c=>c.label.toLowerCase()).join(', ')} still open · “${RLS.reason}”`:`Released to ${p.n} · key tag ${key} · ${r.spot} is free${RLS.text?' · ready text copied':''}`);}

/* ---------- transfer with a reason ---------- */
const newXS=r=>({to:null,why:null,note:'',back:undefined});
const backOpts=g=>[[`Goal · ${g} h`,r5(NOW+g)],['In 1 h',r5(NOW+1)],['End of day',Math.max(16.5,r5(NOW+.5))],['Tomorrow',32],['No time',null]];
function xferPop(r){const A=XS,cur=r.hold[0],g=A.to?GOAL[A.to]:null;
  const head=`<div class="nx-ph"><span class="k">Transfer</span><span class="tg-ro">RO-${r.no}</span><b>${esc(r.cust)}</b><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>`;
  const desks=`<span class="lbl top">To</span><div class="xf-desks">${DESKS.map((k,i)=>`<button class="xf-d${A.to===k?' on':''}${cur===k?' cur':''}" data-xf-to="${k}"${cur===k?' disabled':''}><span class="tg-role">${ROLE[k][0]}</span><b>${ROLE[k][1]}</b><small>${cur===k?'has it now':k==='tech'?(TECH[r.tech]||'—'):HOLDER[k]}</small>${A.to?'':`<span class="px-kbd">${i+1}</span>`}</button>`).join('')}</div>`;
  if(!A.to)return `<div class="nx-pop px-pop xf">${head}${desks}<div class="xf-goal">${I.clock}With ${esc(r.hold[1])} for ${dur(r.hold[2])} — pick a desk (1–6)</div></div>`;
  if(A.back===undefined)A.back=r5(NOW+g);
  const why=`<span class="lbl top">Why</span><div class="lf-r">${WHY[A.to].map((x,i)=>`<button class="tg-chip${A.why===x?' on':''}" data-xf-why="${x}"><span class="px-kbd">${i+1}</span>${x}</button>`).join('')}</div><input class="px-input xf-note" style="margin-top:6px" data-xf-note placeholder="Note for ${esc((A.to==='tech'?(TECH[r.tech]||'the tech'):HOLDER[A.to]).split(' ')[0])} (optional)" value="${esc(A.note)}">`;
  const back=`<span class="lbl top">Back by</span><div class="lf-r lf-when">${backOpts(g).map(([l,h])=>`<button class="tg-chip${A.back===h?' on':''}" data-xf-back="${h===null?'none':h}">${h===null?l:`${fmt(h)} <small>${l}</small>`}</button>`).join('')}</div>`;
  const goal=`<div class="xf-goal" style="margin-top:8px">${I.clock}Goal ${g} h · Held too long after ${2*g} h${A.back!=null?' or at '+fmt(A.back):''}</div>`;
  const who=A.to==='tech'?(TECH[r.tech]||'Mike Rodriguez'):HOLDER[A.to];
  return `<div class="nx-pop px-pop xf">${head}${desks}${why}${back}${goal}<div class="acts"><span class="hint">1–3 why · ⌫ desk · clock restarts</span><button class="px-btn px-btn--primary px-btn--sm" data-xf-go${A.why?'':' disabled'}>${I.swap}Transfer to ${esc(who.split(' ')[0])}<span class="px-kbd">↵</span></button></div></div>`;}
function doXfer2(no){const r=get(no),A=XS,was=!!itemOf(no),who=A.to==='tech'?(TECH[r.tech]||'Mike Rodriguez'):HOLDER[A.to];snap();
  (XF[no]=XF[no]||[]).push({at:NOW,from:`${r.hold[1]} · ${ROLE[r.hold[0]][1]}`,to:A.to,who,why:A.why,note:A.note.trim(),back:A.back});
  r.hold=[A.to,who,0,GOAL[A.to]];delete BACK[no];if(was&&!itemOf(no))CLR.push({at:NOW,ic:'swap',what:`To ${ROLE[A.to][1]}`,no,cust:r.cust});
  toast(`Transferred to ${who} · ${A.why}${A.back!=null?' · back by '+fmt(A.back):''}`);}

/* ---------- thread + desk ---------- */
function xferRows(r){const L=XF[r.no]||[],cur=lastX(r);
  const rows=L.map((x,i)=>{const live=i===L.length-1&&x.to===r.hold[0],late=live&&x.back!=null&&NOW>x.back;return `<div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">To <b style="color:var(--ink)">${esc(x.who)}</b> · ${ROLE[x.to][1]} — <span class="xf-why">${esc(x.why)}</span><time>${esc(atStr(x.at))}</time></div>${x.note?`<p class="xf-n">${esc(x.note)}</p>`:''}<div class="xf-back${late?' late':''}">From ${esc(x.from)}${x.back!=null?` · back by ${fmt(x.back)}${late?' · '+dur(NOW-x.back)+' late':''}`:''}</div></div></div>`;}).join('');
  const [role,who,h,g]=r.hold;return rows+(cur&&cur.to===role?'':`<div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">With <b style="color:var(--ink)">${esc(who)}</b> · ${ROLE[role][1]}<time>${dur(h)}</time></div></div></div>`);}
function xferDesk(r){const x=lastX(r);if(!x||x.to!==r.hold[0])return `<div class="xf-desk"><div class="r"><span>Why</span><span style="color:var(--ink-3)">No reason recorded</span></div></div>`;const late=x.back!=null&&NOW>x.back,L=XF[r.no];
  return `<div class="xf-desk"><div class="r"><span>Why</span><b style="font-weight:500;color:var(--ink)">${esc(x.why)}</b></div>${x.note?`<div class="r"><span>Note</span><span>${esc(x.note)}</span></div>`:''}<div class="r"><span>Back by</span><span class="${late?'late':''}">${x.back==null?'no time set':fmt(x.back)+(late?' · '+dur(NOW-x.back)+' late':'')}</span></div><div class="r"><span>From</span><span>${esc(x.from)} · ${esc(atStr(x.at))}</span></div>${L.length>1?`<div class="xf-hist">${L.length} transfers on this RO</div>`:''}</div>`;}

/* ---------- wiring ---------- */
openPop=(orig=>function(t,no){if(t==='release')RLS=newRLS(get(no));if(t==='xfer')XS=newXS(get(no));orig(t,no);})(openPop);
popHtml=(orig=>function(){if(POP&&POP.type==='release'){const r=get(POP.no);return r?relPop(r):'';}if(POP&&POP.type==='xfer'){const r=get(POP.no);return r?xferPop(r):'';}return orig();})(popHtml);
snap=function(){UNDO.push(JSON.stringify({ros:ROS,rel:D.rel,SNZ,BACK,CLR,SEL,APR,XF}));if(UNDO.length>30)UNDO.shift();};
undo=function(){if(!UNDO.length)return;const s=JSON.parse(UNDO.pop());ROS.splice(0,ROS.length,...s.ros);D.rel.splice(0,D.rel.length,...s.rel);SNZ=s.SNZ;BACK=s.BACK;CLR=s.CLR;SEL=s.SEL;APR=s.APR||APR;XF=s.XF||XF;POP=null;toast('Undone',false);render();};
reset=(orig=>function(){XF=JSON.parse(JSON.stringify(XF0));RLS=null;XS=null;orig();tweak();DEMO='';render();})(reset);
$('[data-reset]').onclick=()=>reset();
demo=function(k){reset();DEMO=k;KB=false;
  if(k==='rlb'){TAB='inbox';SEL='37301';openPop('release','37301');}
  if(k==='rlok'){TAB='inbox';SEL='37489';openPop('release','37489');RLS.text=true;}
  if(k==='xf'){TAB='inbox';SEL='37538';openPop('xfer','37538');XS.to='foreman';XS.why='Second opinion';XS.note='Wheel seal looks like it’s weeping from the hub — want your eyes on it.';}
  if(k==='held'){TAB='desk';SEL='37011';}
  DEMO=k;render();};
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));

mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s),stop=()=>{e.stopPropagation();e.preventDefault();};
  if(!q('.nx-pop')||!POP)return;
  if(POP.type==='release'){const A=RLS;
    const f=q('[data-rl-fix]');if(f){A.fix=f.dataset.rlFix;A.fixText='';render();const i=$('.nx-pop [data-rl-fixtext]');if(i)i.focus();return stop();}
    const sv=q('[data-rl-save]');if(sv){relFix(sv.dataset.rlSave);return stop();}
    const rd=q('[data-rl-road]');if(rd){A.road=rd.dataset.rlRoad;render();return stop();}
    const to=q('[data-rl-to]');if(to){A.to=to.dataset.rlTo==='o'?'o':+to.dataset.rlTo;render();if(A.to==='o'){const i=$('[data-rl-other]');if(i)i.focus();}return stop();}
    if(q('[data-rl-any]')){A.any=true;render();return stop();}
    if(q('[data-rl-back]')){A.any=false;A.reason='';render();return stop();}
    const rs=q('[data-rl-reason]');if(rs){A.reason=rs.dataset.rlReason;render();return stop();}
    const go=q('[data-rl-go]');if(go){const no=POP.no,any=go.dataset.rlGo==='any';run(no,()=>doRelease2(no,any));return stop();}
    if(q('label.rl-opt'))e.stopPropagation();return;}
  if(POP.type==='xfer'){const A=XS;
    const d=q('[data-xf-to]');if(d){if(d.disabled)return stop();A.to=d.dataset.xfTo;A.why=null;A.back=undefined;render();return stop();}
    const w=q('[data-xf-why]');if(w){A.why=w.dataset.xfWhy;render();return stop();}
    const b=q('[data-xf-back]');if(b){A.back=b.dataset.xfBack==='none'?null:+b.dataset.xfBack;render();return stop();}
    if(q('[data-xf-go]')){if(!A.why)return stop();const no=POP.no;run(no,()=>doXfer2(no));return stop();}
    return;}
},true);
mock.addEventListener('change',e=>{if(RLS&&e.target.matches('[data-rl-text]')){RLS.text=e.target.checked;render();}});
mock.addEventListener('input',e=>{const t=e.target;if(RLS){if(t.matches('[data-rl-fixtext]'))RLS.fixText=t.value;if(t.matches('[data-rl-mi]'))RLS.mi=t.value;if(t.matches('[data-rl-other]'))RLS.other=t.value;if(t.matches('[data-rl-note]'))RLS.note=t.value;}if(XS&&t.matches('[data-xf-note]'))XS.note=t.value;});
addEventListener('keydown',e=>{if(!POP||(POP.type!=='release'&&POP.type!=='xfer'))return;const k=e.key,inF=e.target.matches('input,textarea');
  if(k==='Escape'){if(POP.type==='release'&&RLS.fix){RLS.fix=null;render();}else{POP=null;render();}e.stopPropagation();return;}
  if(POP.type==='release'){const r=get(POP.no),bad=relChecks(r).filter(c=>!c.ok);
    if(k==='Enter'){e.preventDefault();if(RLS.fix)relFix(RLS.fix);else if(!bad.length){const no=POP.no;run(no,()=>doRelease2(no,false));}else if(RLS.any&&RLS.reason){const no=POP.no;run(no,()=>doRelease2(no,true));}e.stopPropagation();return;}
    e.stopPropagation();return;}
  if(POP.type==='xfer'){if(k==='Enter'){e.preventDefault();if(XS.to&&XS.why){const no=POP.no;run(no,()=>doXfer2(no));}e.stopPropagation();return;}
    if(!inF){const n=+k;if(!XS.to&&n>=1&&n<=6){const d=DESKS[n-1];if(d!==get(POP.no).hold[0]){XS.to=d;XS.why=null;XS.back=undefined;render();}}else if(XS.to&&n>=1&&n<=WHY[XS.to].length){XS.why=WHY[XS.to][n-1];render();}else if(XS.to&&k==='Backspace'){XS.to=null;XS.why=null;render();}}
    e.stopPropagation();return;}
},true);

/* =================== yard layer =================== */
let DRAG=null, CLASH=null;
PEOPLE['Dixie Fleet Services']=[{n:'Ron Pike',r:'Fleet manager',ph:'(910) 555-0148',pref:'Call',ok:true},{n:'Luis Ortega',r:'Driver',ph:'(910) 555-0187',pref:'Text'}];
PEOPLE['Mount Airy Movers']=[{n:'Beth Sloan',r:'Office manager',ph:'(336) 555-0175',pref:'Email',em:'dispatch@mtairymovers.com',ok:true}];
function tweakYard(){const d=get('37641');if(d){d.ct=[['Call','10:05','Dana Kowalski','Update given','Driver says about an hour out — just left Lexington.','Luis Ortega']];d.ev=[[10.08,'call']];}
  const g=get('37420');if(g)g.spot='B2';}
tweakYard();

/* ---------- arrival ETA from the call log ---------- */
const NUMW={a:1,an:1,one:1,two:2,three:3};
function etaFromText(txt,at){if(!txt)return null;const s=txt.toLowerCase();let m;
  if(/half an hour/.test(s))return at+.5;
  if(m=s.match(/(\d+)\s*(?:min|mins|minutes)\b/))return at+(+m[1])/60;
  if(m=s.match(/\b(an?|one|two|three|\d+(?:\.\d+)?)\s*(and a half\s*)?(?:hour|hours|hr|hrs)\b/)){let h=NUMW[m[1]]??+m[1];if(m[2])h+=.5;return at+h;}
  if(m=s.match(/(?:at|by|around|about)\s*(\d{1,2}):(\d{2})/)){let h=+m[1];if(h<7)h+=12;return h+(+m[2])/60;}
  return null;}
const hm=t=>{const m=String(t).match(/^(\d{1,2}):(\d{2})$/);return m?+m[1]+(+m[2])/60:null;};
function parseEta(r){for(let i=r.ct.length-1;i>=0;i--){const c=r.ct[i],at=hm(c[1]);if(at==null)continue;const e=etaFromText(c[4],at);if(e!=null)return {eta:e,src:c};}return {eta:hm(r.booked||r.age)??NOW+2,src:null};}
const etaOf=r=>parseEta(r).eta;
function syncEta(){ROS.forEach(r=>{if(r.cat!=='arr')return;r.booked=r.booked||r.age;r.age=fmt(etaOf(r));});}
const mins=h=>{const m=Math.round(h*60);return m<60?m+' min':dur(m/60);};

/* ---------- spot clashes ---------- */
function clashes(){const by={};ROS.forEach(x=>{(by[x.spot]=by[x.spot]||[]).push(x);});return Object.keys(by).filter(s=>s!=='—'&&by[s].length>1).map(s=>({spot:s,ros:by[s]}));}

/* needs: arrival countdown text + a Fix spot item for each clash */
needs=(orig=>function(){syncEta();let L=orig();
  L=L.map(x=>{const r=x[0];if(r.cat!=='arr')return x;const e=etaOf(r),d=e-NOW,y=x.slice();
    y[3]=d>.25?`Arriving ~${fmt(e)} · in ${mins(d)} · ${r.spot}`:d>0?`Arriving now · ~${fmt(e)} · ${r.spot}`:`Due ${fmt(e)} · ${mins(-d)} late · call the driver`;y[1]=d>.25?5:-1;return y;});
  clashes().forEach(c=>{const pick=c.ros.slice().reverse().find(r=>r.cat!=='arr'&&!L.some(x=>x[0]===r))||c.ros[c.ros.length-1];L=L.filter(x=>x[0]!==pick);const other=c.ros.find(r=>r!==pick);L.push([pick,0,'pin',`Shares ${c.spot} with ${other.no} — which one is there?`,'Fix spot','Ready to go']);});
  return L.sort((a,b)=>a[1]-b[1]);})(needs);
act=(orig=>function(no){const x=itemOf(no);if(x&&x[4]==='Fix spot'){SEL=no;TAB='yard';CLASH=get(no).spot;MOVE=false;POP=null;render();return;}orig(no);})(act);

/* ---------- moving ---------- */
function moveTo(no,spot){const r=get(no);if(!r)return;const from=r.spot,before=clashes().length;snap();r.spot=spot;SEL=no;MOVE=false;CLASH=null;DEMO='';const fixed=clashes().length<before;
  toast(`Moved RO-${no} from ${from} to ${spot}${fixed?' · clash fixed':''}`);render();}

/* ---------- yard view ---------- */
function vYard(r){const by={};ROS.forEach(x=>{(by[x.spot]=by[x.spot]||[]).push(x);});const CL=clashes();
  const tile=id=>{const L=by[id]||[];
    if(L.length>1){const on=L.some(x=>x.no===SEL);return `<button class="i2-s occ clash${on?' tg-sel':''}" data-clash="${id}" data-at="${id}" title="${esc(L.map(x=>x.no+' '+x.cust).join(' · '))}"><span class="l">${id}</span><b>${L.map(x=>x.no.slice(-4)).join('<em>·</em>')}</b><small>${L.length} trucks</small><span class="fl"><i class="cl">!</i></span></button>`;}
    const x=L[0];
    if(x&&x.cat==='arr'){const e=etaOf(x),d=e-NOW;return `<div class="i2-s rsv${x.no===SEL?' tg-sel':''}${d<=0?' late':d<=.25?' soon':''}" data-sel="${x.no}" data-at="${id}" data-drag="${x.no}" draggable="true" title="${esc(x.cust)} · held for this arrival"><span class="l">${id}</span><b>${sq('arr')}${x.no.slice(-4)}</b><small title="ETA ${fmt(e)}">${d>0?(d<1?`in ${Math.round(d*60)}m`:`~${fmt(e)}`):`late ${Math.round(-d*60)}m`}</small></div>`;}
    if(x)return `<div role="button" tabindex="0" class="i2-s occ${x.no===SEL?' tg-sel':''}${MOVE&&x.no!==SEL?' dim':''}" data-sel="${x.no}" data-at="${id}" data-drag="${x.no}" draggable="true" title="${esc(x.cust)}"><span class="l">${id}</span><b>${sq(x.cat)}${x.no.slice(-4)}${x.live?'<i class="tg-live"></i>':''}</b><small>${esc(x.cust)}</small><span class="fl">${x.warr?I.warranty:''}${x.late?'<i class="lt"></i>':''}</span></div>`;
    return MOVE?`<button class="i2-s free" data-free="${id}" data-drop="${id}" data-at="${id}"><span class="l">${id}</span></button>`:`<div class="i2-s" data-at="${id}" data-drop="${id}"><span class="l">${id}</span></div>`;};
  const grid=(ids,cols)=>`<div class="i2-g" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${ids.map(tile).join('')}</div>`;
  const lot=(row,n)=>Array.from({length:n},(_,i)=>row+(i+1));
  let bar;const cl=CLASH&&CL.find(c=>c.spot===CLASH);
  if(cl)bar=`<div class="yd-bar cl"><span class="k">${I.flag}Spot clash</span><span class="txt">Two ROs claim <b>${ZONE(cl.spot)} ${cl.spot}</b> — ${cl.ros.map(x=>`<b>${x.no}</b> ${esc(x.cust)}`).join(' and ')}. Which one is really there?</span><span class="btns">${cl.ros.map(x=>`<button class="px-btn px-btn--sm" data-keep="${x.no}" title="The other one gets a new spot">${x.no} is here</button>`).join('')}<button class="px-btn px-btn--sm px-btn--ghost" data-clash-x>Later</button></span></div>`;
  else if(MOVE)bar=`<div class="yd-bar mv"><span class="k">Move</span><span><b style="font-weight:500">RO-${r.no} · ${esc(r.cust)}</b> from ${ZONE(r.spot)} <span class="px-id">${r.spot}</span> — pick a free spot</span><span class="sp"></span><button class="px-btn px-btn--sm" data-move="0">Cancel<span class="px-kbd">Esc</span></button></div>`;
  else if(DEMO==='drag')bar=`<div class="yd-bar coach"><span class="k">Try it</span><span>Drag <b style="font-weight:500">${esc(r.cust)}</b> from the list — or any truck on the map — onto a free spot.</span><span class="sp"></span><span class="yd-hint">or press <span class="px-kbd">M</span></span></div>`;
  else bar=`<div class="yd-bar">${sq(r.cat)}<span class="tg-ro">RO-${r.no}</span><h3>${esc(r.cust)}</h3><span class="at">${I.pin}${ZONE(r.spot)}<b>${r.spot}</b></span>${r.cat==='arr'?`<span class="stt">${I.inArrow}${etaOf(r)>NOW?'arriving ~'+fmt(etaOf(r)):'due '+fmt(etaOf(r))}</span>`:`<span class="stt">${st(r)}</span>`}<span class="sp"></span>${CL.length?`<button class="px-btn px-btn--sm cx-warnbtn" data-clash="${CL[0].spot}">${I.flag}${CL.length} spot clash${CL.length>1?'es':''}</button>`:''}<span style="font-size:12px;color:var(--ink-3);white-space:nowrap">Key tag <span class="px-id" style="color:var(--ink-2)">1${r.no.slice(-2)}</span></span><button class="px-btn px-btn--sm" data-move="1">${I.pin}Move…<span class="px-kbd">M</span></button></div>`;
  return `<div class="yd">${bar}
   <div class="i2-row"><section class="i2-z" style="flex:1.55"><div class="i2-zh">Shop floor<small>UpTime · awning · bays 1–8</small></div>${grid(['UP','B1','B2','B3','B4','AW1','B5','B6','B7','B8'],5)}</section>
   <section class="i2-z" style="flex:1"><div class="i2-zh">Check-in<small>arrival line · triage lanes</small></div>${grid(['W1','W2','W3','W4'],4)}<div style="height:6px"></div>${grid(['T1','T2','T3'],4)}</section></div>
   <section class="i2-z"><div class="i2-zh">Parking lot<small>C · waiting on customers &nbsp;·&nbsp; D · ready to release &nbsp;·&nbsp; E · overflow</small></div>${grid(lot('C',10),10)}<div style="height:6px"></div>${grid(lot('D',10),10)}<div style="height:6px"></div>${grid(lot('E',10),10)}</section>
   <div class="i2-row"><section class="i2-z" style="flex:1"><div class="i2-zh">Warranty<small>on the yard</small></div><div style="display:flex;flex-direction:column;gap:6px">${ROS.filter(x=>x.warr).map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer" data-sel="${x.no}"><span class="tg-ro">${x.no}</span><b style="font-weight:500;white-space:nowrap">${esc(x.cust)}</b>${spot(x.spot)}<span style="margin-left:auto;color:var(--ink-3);font-size:12px;white-space:nowrap">${x.warr[0]}% · ${x.warr[1]} missing</span><span style="width:60px" class="i6-wb"><i style="width:${x.warr[0]}%"></i></span></div>`).join('')}</div></section>
   <section class="i2-z" style="flex:.8"><div class="i2-zh">Released today<small>${D.rel.length}</small></div><div style="display:flex;flex-direction:column;gap:6px">${D.rel.map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="tg-ro">${x.no}</span><b style="font-weight:500">${esc(x.cust)}</b><span style="margin-left:auto;color:var(--ink-3);font-size:12px">${x.at}</span></div>`).join('')}</div></section></div>
   <div class="i2-leg">${ORDER.map(k=>`<span>${sq(k)}${CAT[k][0]}</span>`).join('')}<span><i style="width:14px;height:10px;border:1.5px dashed var(--border-strong);border-radius:3px;display:inline-block;box-sizing:border-box"></i>Held for an arrival</span><span><i class="cl" style="width:12px;height:12px;border-radius:50%;background:var(--warn);display:inline-block"></i>Spot clash</span><span><i class="tg-live"></i>On the clock</span><span style="color:var(--accent-text)">${I.warranty}Warranty</span><span class="yd-hint" style="margin-left:auto">Drag a truck onto a free spot · <span class="px-kbd">M</span> move</span></div>
  </div>`;}

/* ---------- inbox: ETA line for arrivals ---------- */
vInbox=(orig=>function(r){let h=orig(r);if(r.cat!=='arr')return h;const {eta,src}=parseEta(r),d=eta-NOW;
  const row=`<div class="i3-m sys eta-row"><span class="gi">${I.inArrow}</span><div class="bd"><div class="hd">ETA <b>~${fmt(eta)}</b> · ${src?`from ${esc(src[2].split(' ')[0])}’s ${src[0].toLowerCase()} at ${src[1]}: <span class="eta-q">“${esc((src[4].match(/[^.—]*(?:min|hour|hr|\d:\d\d)[^.—]*/i)||[src[4]])[0].trim())}”</span>`:`booked time · no call yet`}<time>${d>0?'in '+mins(d):mins(-d)+' late'}</time></div></div></div>`;
  return h.replace('<div class="i3-appr cx-card">',row+'<div class="i3-appr cx-card">');})(vInbox);
follow=(orig=>function(S,r){if(r&&r.cat==='arr'&&S.note){const e=etaFromText(S.note,NOW);if(e!=null)return ['snz',`ETA becomes ~${fmt(e)}`];}return orig(S,r);})(follow);
applyLog=(orig=>function(S,no){const r=get(no),arr=r&&r.cat==='arr',e=arr?etaFromText(S.note,NOW):null;orig(S,no);if(arr){delete SNZ[no];toast(e!=null?`ETA updated to ~${fmt(e)} from your note`:`${S.kind} logged on RO-${no}`);}})(applyLog);

/* ---------- wiring ---------- */
render=(orig=>function(){syncEta();orig();if(TAB==='yard')$$('.i3-it').forEach(it=>it.setAttribute('draggable','true'));})(render);
snap=function(){UNDO.push(JSON.stringify({ros:ROS,rel:D.rel,SNZ,BACK,CLR,SEL,APR,XF}));if(UNDO.length>30)UNDO.shift();};
reset=(orig=>function(){CLASH=null;DRAG=null;orig();tweakYard();DEMO='';render();})(reset);
$('[data-reset]').onclick=()=>reset();
demo=function(k){reset();DEMO=k;KB=false;MOVE=false;
  if(k==='drag'){TAB='yard';SEL='37590';}
  if(k==='eta'){TAB='inbox';SEL='37641';}
  if(k==='etay'){TAB='yard';SEL='37641';}
  if(k==='clash'){TAB='yard';SEL='37420';CLASH='B2';}
  render();};
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));
mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s),stop=()=>{e.stopPropagation();e.preventDefault();};
  const fr=q('[data-free]');if(fr){moveTo(SEL,fr.dataset.free);return stop();}
  const cl=q('[data-clash]');if(cl){CLASH=cl.dataset.clash;TAB='yard';MOVE=false;render();return stop();}
  if(q('[data-clash-x]')){CLASH=null;render();return stop();}
  const kp=q('[data-keep]');if(kp){const c=clashes().find(c=>c.spot===CLASH);if(c){const other=c.ros.find(x=>x.no!==kp.dataset.keep);SEL=other.no;MOVE=true;CLASH=null;toast(`${kp.dataset.keep} stays in ${c.spot} — pick a spot for ${other.no}`,false);}render();return stop();}
  if(q('[data-move="1"]')){CLASH=null;}
},true);
mock.addEventListener('dragstart',e=>{const d=e.target.closest&&e.target.closest('[data-drag],.ib.v-yard .i3-it');if(!d)return;const no=d.dataset.drag||d.dataset.sel;DRAG=no;try{e.dataTransfer.setData('text/plain',no);e.dataTransfer.effectAllowed='move';}catch(_){}
  const yd=$('.yd');if(yd)yd.classList.add('dragging');$$(`.yd [data-drag="${no}"]`).forEach(x=>x.classList.add('src'));if(d.classList.contains('i3-it'))d.classList.add('dragsrc');});
mock.addEventListener('dragover',e=>{const t=e.target.closest&&e.target.closest('[data-drop]');if(t&&DRAG){e.preventDefault();try{e.dataTransfer.dropEffect='move';}catch(_){}$$('.yd .over').forEach(x=>{if(x!==t)x.classList.remove('over');});t.classList.add('over');}});
mock.addEventListener('dragleave',e=>{const t=e.target.closest&&e.target.closest('[data-drop]');if(t&&!t.contains(e.relatedTarget))t.classList.remove('over');});
mock.addEventListener('drop',e=>{const t=e.target.closest&&e.target.closest('[data-drop]');if(t&&DRAG){e.preventDefault();const no=DRAG;DRAG=null;moveTo(no,t.dataset.drop);}});
mock.addEventListener('dragend',()=>{DRAG=null;const yd=$('.yd');if(yd)yd.classList.remove('dragging');$$('.over,.src,.dragsrc').forEach(x=>x.classList.remove('over','src','dragsrc'));});
mock.addEventListener('input',e=>{const t=e.target;if(!t.matches('[data-lf-note]'))return;const lf=t.closest('[data-lf]'),r=get(lf.dataset.lf==='p'?POP.no:SEL);if(!r||r.cat!=='arr')return;const fu=lf.querySelector('.lf-fu span');const e2=etaFromText(t.value,NOW);if(fu&&e2!=null)fu.textContent=`ETA becomes ~${fmt(e2)}`;});
addEventListener('keydown',e=>{const k=e.key,inF=e.target.matches('input,textarea,select');
  if(k==='Escape'&&CLASH&&!POP){CLASH=null;render();e.stopPropagation();return;}
  if(TAB==='yard'&&!POP&&!inF&&!HELP&&!TPLED&&(k==='m'||k==='M')&&!e.ctrlKey&&!e.metaKey){MOVE=true;CLASH=null;render();e.stopPropagation();}
},true);

/* =================== header layer =================== */
let FILTER=null, PAGE='triage', LASTSEEN=null, NEWLATE=new Set(), FLY=null, BUMP=false, SRI=0, FLASHT=null;
const PAGES={inbox:'Inbox',console:'Console',triage:'Triage',ros:'Repair orders',foreman:'Foreman',warranty:'Warranty',manager:'Manager',parts:'Parts',timelog:'Time log',fixes:'Fixes',career:'Career'};
function dueBack(r){const lx=lastX(r);return !!(lx&&lx.back!=null&&lx.to===r.hold[0]&&NOW>lx.back+1e-6);}
const LATE=r=>!!(r.late||(r.cat==='arr'&&etaOf(r)<NOW)||dueBack(r));
const lateSet=()=>new Set(ROS.filter(LATE).map(r=>r.no));
const FILT={apr:['awaiting approval',r=>r.cat!=='arr'&&openOps(r).length>0],rdy:['ready to release',r=>r.cat==='rdy'],late:['late',LATE]};
const match=r=>!FILTER||FILT[FILTER][1](r);

/* 1 · facts filter the list (and dim the yard) */
needsNow=(orig=>function(){const L=orig();return FILTER?L.filter(x=>match(x[0])):L;})(needsNow);
function patchHeader(){const f=$('.tg-facts');if(!f)return;const n=k=>ROS.filter(FILT[k][1]).length;
  const b=(k,txt,cnt,w)=>`<button class="hf-f${w?' w':''}${FILTER===k?' on':''}" data-filt="${k}" title="${FILTER===k?'Clear filter':'Show only these in Needs action'}"><b>${cnt}</b>${txt}${I.x.replace('px-ico','px-ico x')}</button>`;
  f.className='tg-facts hf';f.innerHTML=`<button class="hf-f" data-filt="all" title="Show everything"><b>${ROS.length}</b>on the yard</button><span class="hf-sep">·</span>${b('apr','awaiting approval',n('apr'))}<span class="hf-sep">·</span>${b('rdy','ready to release',n('rdy'))}<span class="hf-sep">·</span>${b('late','late',n('late'),true)}`;
  const inp=$('.tg-srch input');if(inp)inp.placeholder='RO, unit, customer, VIN or spot';}
function patchList(){const lh=$('.i3-lh');if(lh&&FILTER){const n=lh.querySelector('.n');const c=document.createElement('button');c.className='nx-filt'+(FILTER==='late'?' w':'');c.dataset.filtX='1';c.innerHTML=`${FILT[FILTER][0][0].toUpperCase()+FILT[FILTER][0].slice(1)}${I.x}`;n.after(c);}
  const em=$('.nx-empty');if(em&&FILTER){em.innerHTML=`<div class="ring" style="background:var(--fill);color:var(--ink-3)">${I.check}</div><h3>Nothing ${FILT[FILTER][0]}</h3><p>No RO on the yard is ${FILT[FILTER][0]} right now.</p><button class="px-btn px-btn--sm" data-filt-x>Clear filter</button>`;}
  NEWLATE.forEach(no=>{const t=$(`.i3-it[data-sel="${no}"] .t`);if(t&&!t.querySelector('.nx-new'))t.querySelector('b').insertAdjacentHTML('afterend','<span class="nx-new" title="Turned late while you were on another page">New</span>');});}
function patchYard(){const yd=$('.yd');if(!yd)return;if(FILTER){yd.classList.add('filtering');$$('.yd [data-sel]').forEach(el=>{const r=get(el.dataset.sel);if(r&&match(r))el.classList.add('match');});}
  if(FLASHT){const t=$(`.yd [data-at="${FLASHT}"]`);if(t){t.classList.add('flash');}FLASHT=null;}}

/* 2 · late badge on the rail */
function patchRail(){const as=$$('.tg-rail a'),keys=['sidebar','search',...RAIL.filter(k=>k!=='|'),'gear'];as.forEach((a,i)=>{const k=keys[i];if(PAGES[k]){a.dataset.page=k;a.title=PAGES[k];a.classList.toggle('is-on',k===PAGE);}});
  const tri=$('.tg-rail a[data-page="triage"]');if(!tri)return;const n=lateSet().size;
  if(PAGE!=='triage'&&n){tri.insertAdjacentHTML('beforeend',`<span class="rl-badge${BUMP?' bump':''}">${n}</span>`);tri.title=`Triage · ${n} late`;}
  if(FLY&&PAGE!=='triage'){const app=$('.tg-app');const nw=FLY.nos.map(get).filter(Boolean);app.insertAdjacentHTML('beforeend',`<div class="rl-fly" style="top:${tri.offsetTop-4}px">${nw.map(r=>`<div class="r"><span class="tg-late">Late</span><span><b>${esc(r.cust)}</b> · ${r.cat==='arr'?'arrival past its ETA':dueBack(r)?'past its back-by time':'over its stage goal'}</span></div>`).join('')}<button class="px-link" data-page="triage">Open Triage →</button></div>`);}}
function patchPage(){const p=$('.tg-panel');if(!p||PAGE==='triage')return;const n=lateSet().size;
  p.innerHTML=`<header class="tg-head"><h1>${PAGES[PAGE]}</h1><span class="tg-facts" style="color:var(--ink-4)">Another page — a stand-in for this mock-up</span></header><div class="pg-ph"><div class="pg-note">${I.triage}<div><b>Triage keeps watch while you’re here.</b><p>The badge on its icon counts late ROs (${n} now). Press +30 min on the shop clock to see a new one turn late.</p></div><button class="px-btn px-btn--sm" data-page="triage">Back to Triage</button></div>${'<div class="pg-sk"></div>'.repeat(12)}</div>`;}
function goPage(k){if(k===PAGE)return;if(PAGE==='triage'&&k!=='triage'){LASTSEEN=lateSet();NEWLATE=new Set();}if(k==='triage'&&LASTSEEN){NEWLATE=new Set([...lateSet()].filter(n=>!LASTSEEN.has(n)));LASTSEEN=null;}PAGE=k;FLY=null;POP=null;SRCH=false;render();}
tick=(orig=>function(h){const before=lateSet();orig(h);const nw=[...lateSet()].filter(n=>!before.has(n));if(nw.length&&PAGE!=='triage'){BUMP=true;FLY={nos:nw};render();BUMP=false;clearTimeout(window.__fly);window.__fly=setTimeout(()=>{FLY=null;render();},7000);}})(tick);

/* 3 · search answers “where is it?” */
const VIN=r=>'4V4NC9EH'+String((+r.no*7919)%1000000).padStart(6,'0');
function srFind(q){q=q.trim().toLowerCase().replace(/^(where('?s| is)?|unit|ro|truck|vin)\s+/,'').trim();if(!q)return {q,L:[],R:[]};
  const sc=r=>{const sp=r.spot.toLowerCase();if(sp===q)return 100;if(r.unit.toLowerCase()===q)return 90;if(r.no.startsWith(q))return 80;if(VIN(r).toLowerCase().endsWith(q)&&q.length>=4)return 75;if(r.cust.toLowerCase().split(' ').some(w=>w.startsWith(q)))return 60;if(r.cust.toLowerCase().includes(q))return 40;if(r.unit.toLowerCase().includes(q))return 30;return 0;};
  const L=ROS.map(r=>[r,sc(r)]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);
  const R=D.rel.filter(x=>x.no.startsWith(q)||x.cust.toLowerCase().includes(q));return {q,L,R};}
function srRow(r,i,q){const arr=r.cat==='arr',vm=q.length>=4&&VIN(r).toLowerCase().endsWith(q),um=r.unit.toLowerCase()===q;
  const wh=arr?`<span class="sr-where arr"><span class="w1">${I.inArrow}Arriving ~${fmt(etaOf(r))}</span><span class="w2">held ${ZONE(r.spot)} ${r.spot}</span></span>`:`<span class="sr-where"><span class="w1">${I.pin}${ZONE(r.spot)} <span class="px-id">${r.spot}</span></span><span class="w2">Key tag <span class="px-id">1${r.no.slice(-2)}</span></span></span>`;
  return `<div class="it sr-r${i===SRI?' k':''}" data-sel="${r.no}" data-pick>${sq(r.cat)}<span class="tg-ro">${r.no}</span><b>${esc(r.cust)}</b><small>${um?`<mark>Unit ${esc(r.unit)}</mark>`:`Unit ${esc(r.unit)}`} · ${vm?`VIN …<mark>${VIN(r).slice(-6)}</mark>`:`${CAT[r.cat][0]}`}</small>${wh}<button class="px-btn px-btn--icon px-btn--ghost px-btn--sm sr-yard" data-yard="${r.no}" title="Show on the yard  ⇧↵">${I.pin}</button></div>`;}
function srPop(){const raw=($('.tg-srch input')||{}).value||'';const {q,L,R}=srFind(raw);
  const ft=`<div class="ft"><span><span class="px-kbd">↑</span><span class="px-kbd">↓</span> move</span><span><span class="px-kbd">↵</span> open</span><span><span class="px-kbd">⇧</span><span class="px-kbd">↵</span> show on the yard</span><span><span class="px-kbd">Esc</span> close</span></div>`;
  if(!q){const nx=ROS.filter(r=>r.cat==='arr').sort((a,b)=>etaOf(a)-etaOf(b)).slice(0,2),rc=flat().slice(0,4).map(get);let i=0;return `<div class="h">Recent</div>${rc.map(r=>srRow(r,i++,'')).join('')}${nx.length?`<div class="h">Arriving next</div>${nx.map(r=>srRow(r,i++,'')).join('')}`:''}${ft}`;}
  if(!L.length&&!R.length)return `<div class="nores">No RO, unit, customer, VIN or spot matches “${esc(raw)}”.</div>${ft}`;
  return `${L.length?`<div class="h">${L.length} on the yard</div>`:''}${L.map((r,i)=>srRow(r,i,q)).join('')}${R.length?`<div class="h">Released today</div>${R.map(x=>`<div class="it rel"><span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b><span style="margin-left:auto">Released ${esc(x.at)}</span></div>`).join('')}`:''}${ft}`;}
function showOnYard(no){const r=get(no);if(!r)return;SEL=no;SRCH=false;QV='';TAB='yard';MOVE=false;FLASHT=r.spot;render();}

/* ---------- wiring ---------- */
render=(orig=>function(){orig();patchHeader();patchRail();patchList();patchYard();patchPage();})(render);
reset=(orig=>function(){FILTER=null;PAGE='triage';LASTSEEN=null;NEWLATE=new Set();FLY=null;SRI=0;orig();})(reset);
$('[data-reset]').onclick=()=>reset();
demo=function(k){reset();DEMO=k;KB=false;
  if(k==='flate'){FILTER='late';TAB='inbox';SEL='37590';}
  if(k==='fapr'){FILTER='apr';TAB='yard';SEL='37590';}
  if(k==='badge'){TAB='inbox';render();goPage('ros');return;}
  if(k==='search'){TAB='inbox';SRCH=true;QV='1204';SRI=0;}
  render();if(k==='search'){$('.sr-pop').innerHTML=srPop();}};
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));
mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s),stop=()=>{e.stopPropagation();e.preventDefault();};
  const pg=q('[data-page]');if(pg&&(q('.tg-rail')||q('.pg-note')||q('.rl-fly'))){goPage(pg.dataset.page);return stop();}
  if(PAGE!=='triage'){e.stopPropagation();return;}
  const f=q('[data-filt]');if(f){const k=f.dataset.filt;FILTER=k==='all'||FILTER===k?null:k;POP=null;const L=flat();if(L.length&&!L.includes(SEL))SEL=L[0];render();return stop();}
  if(q('[data-filt-x]')){FILTER=null;render();return stop();}
  const y=q('[data-yard]');if(y){showOnYard(y.dataset.yard);return stop();}
  const it=q('.i3-it[data-sel]');if(it&&NEWLATE.has(it.dataset.sel)){NEWLATE.delete(it.dataset.sel);}
},true);
mock.addEventListener('input',e=>{if(e.target.matches('.tg-srch input')){SRI=0;$('.sr-pop').innerHTML=srPop();}});
addEventListener('keydown',e=>{const k=e.key;
  if(PAGE!=='triage'){if(k==='Escape'||k==='/'||k.length===1||k==='Enter'||k.startsWith('Arrow'))e.stopPropagation();return;}
  if(SRCH){const rows=$$('.sr-pop .sr-r');
    if(k==='ArrowDown'||k==='ArrowUp'){e.preventDefault();if(rows.length){SRI=(SRI+(k==='ArrowDown'?1:-1)+rows.length)%rows.length;rows.forEach((el,i)=>el.classList.toggle('k',i===SRI));}e.stopPropagation();return;}
    if(k==='Enter'){e.preventDefault();const el=rows[SRI]||rows[0];if(el){const no=el.dataset.sel;if(e.shiftKey)showOnYard(no);else{SEL=no;SRCH=false;QV='';render();}}e.stopPropagation();return;}
    return;}
  if(k==='Escape'&&FILTER&&!POP&&!MOVE&&!CLASH&&!HELP){FILTER=null;render();e.stopPropagation();}
},true);
render();
