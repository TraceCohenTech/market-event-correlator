"use client";

import { useState, useMemo } from "react";

const ROWS = [{"date":"2023-01-03","qqq":-1.5522,"spy":-0.9236,"ndx":-1.5924},{"date":"2023-01-04","qqq":-0.3375,"spy":0.1514,"ndx":-0.3155},{"date":"2023-01-05","qqq":-0.9317,"spy":-0.613,"ndx":-0.8861},{"date":"2023-01-06","qqq":2.0695,"spy":1.4297,"ndx":2.1549},{"date":"2023-01-09","qqq":-0.1071,"spy":-0.643,"ndx":-0.2211},{"date":"2023-01-10","qqq":1.2394,"spy":0.8599,"ndx":1.2353},{"date":"2023-01-11","qqq":1.3252,"spy":0.8388,"ndx":1.2733},{"date":"2023-01-12","qqq":0.3344,"spy":0.0731,"ndx":0.1587},{"date":"2023-01-13","qqq":1.6166,"spy":1.2398,"ndx":1.5785},{"date":"2023-01-17","qqq":0.2743,"spy":-0.1782,"ndx":0.2224},{"date":"2023-01-18","qqq":-1.8473,"spy":-1.8847,"ndx":-1.9449},{"date":"2023-01-19","qqq":-0.3874,"spy":-0.1849,"ndx":-0.4365},{"date":"2023-01-20","qqq":2.128,"spy":1.4817,"ndx":2.2455},{"date":"2023-01-23","qqq":1.9115,"spy":0.9856,"ndx":1.8927},{"date":"2023-01-24","qqq":0.3689,"spy":0.3309,"ndx":0.3702},{"date":"2023-01-25","qqq":1.3955,"spy":1.1112,"ndx":1.5356},{"date":"2023-01-26","qqq":0.728,"spy":0.4019,"ndx":0.6591},{"date":"2023-01-27","qqq":1.4589,"spy":0.5004,"ndx":1.3866},{"date":"2023-01-30","qqq":-0.9081,"spy":-0.5487,"ndx":-1.1187},{"date":"2023-01-31","qqq":1.4846,"spy":1.3337,"ndx":1.5608},{"date":"2023-02-01","qqq":2.2112,"spy":1.3795,"ndx":2.2765,"et":"Fed","en":"FOMC +25bps","ed":"Fed raised 25bps, signaled more hikes ahead"},{"date":"2023-02-02","qqq":1.3493,"spy":0.4628,"ndx":1.1692,"et":"Earnings","en":"Apple Q1 beat","ed":"AAPL beat earnings; iPhone demand strong despite macro fears"},{"date":"2023-02-03","qqq":0.4066,"spy":0.1847,"ndx":0.4186},{"date":"2023-02-06","qqq":0.0264,"spy":0.0098,"ndx":-0.0344},{"date":"2023-02-07","qqq":2.1156,"spy":1.5457,"ndx":2.0306},{"date":"2023-02-08","qqq":-1.3515,"spy":-0.6003,"ndx":-1.4562},{"date":"2023-02-09","qqq":-2.3184,"spy":-1.7664,"ndx":-2.3378},{"date":"2023-02-10","qqq":0.0735,"spy":0.5371,"ndx":-0.0136},{"date":"2023-02-13","qqq":1.1191,"spy":1.0056,"ndx":1.18},{"date":"2023-02-14","qqq":1.2744,"spy":0.3404,"ndx":1.4323},{"date":"2023-02-15","qqq":1.3775,"spy":0.8846,"ndx":1.2472},{"date":"2023-02-16","qqq":-0.3548,"spy":-0.1248,"ndx":-0.4209},{"date":"2023-02-17","qqq":0.0299,"spy":0.2955,"ndx":0.0476},{"date":"2023-02-21","qqq":-1.0866,"spy":-0.985,"ndx":-1.1873},{"date":"2023-02-22","qqq":-0.1256,"spy":-0.2453,"ndx":-0.1605},{"date":"2023-02-23","qqq":-0.3859,"spy":-0.2241,"ndx":-0.3624},{"date":"2023-02-24","qqq":0.0308,"spy":0.2428,"ndx":-0.0847},{"date":"2023-02-27","qqq":-0.383,"spy":-0.5352,"ndx":-0.4047},{"date":"2023-02-28","qqq":0.0886,"spy":-0.2442,"ndx":0.0031},{"date":"2023-03-01","qqq":-0.7024,"spy":-0.1694,"ndx":-0.7329},{"date":"2023-03-02","qqq":1.7148,"spy":1.3064,"ndx":1.8155},{"date":"2023-03-03","qqq":1.4523,"spy":1.1208,"ndx":1.4871},{"date":"2023-03-06","qqq":-0.3057,"spy":-0.1432,"ndx":-0.3416},{"date":"2023-03-07","qqq":-1.243,"spy":-1.5207,"ndx":-1.2275},{"date":"2023-03-08","qqq":0.3538,"spy":0.133,"ndx":0.2813},{"date":"2023-03-09","qqq":-1.9006,"spy":-2.0463,"ndx":-1.921},{"date":"2023-03-10","qqq":-1.4616,"spy":-1.2993,"ndx":-1.4283,"et":"Banking Crisis","en":"SVB Failure","ed":"Silicon Valley Bank closed by FDIC regulators \u2014 largest bank failure since 2008"},{"date":"2023-03-13","qqq":1.3811,"spy":0.9298,"ndx":1.4557,"et":"Banking Crisis","en":"Signature Bank closed","ed":"Signature Bank seized; contagion fears spread; BTFP bailout announced"},{"date":"2023-03-14","qqq":1.0397,"spy":0.315,"ndx":1.0045,"et":"AI","en":"GPT-4 launched","ed":"OpenAI released GPT-4; multimodal capabilities; AI arms race accelerated; MSFT/GOOGL sprint"},{"date":"2023-03-15","qqq":1.4319,"spy":0.8785,"ndx":1.391},{"date":"2023-03-16","qqq":2.9564,"spy":2.4016,"ndx":3.0259,"et":"Banking Crisis","en":"Credit Suisse/First Republic backstop","ed":"Swiss National Bank extended CS $54B credit line; First Republic got $30B deposit infusion"},{"date":"2023-03-17","qqq":-0.4434,"spy":-0.8214,"ndx":-0.4},{"date":"2023-03-20","qqq":0.562,"spy":0.7523,"ndx":0.5991,"et":"AI","en":"Goldman: AI could displace 300M jobs","ed":"Goldman Sachs report on AI job displacement; AI narrative exploded in media"},{"date":"2023-03-21","qqq":0.7794,"spy":0.4204,"ndx":0.7758},{"date":"2023-03-22","qqq":-1.3375,"spy":-1.6603,"ndx":-1.3754},{"date":"2023-03-23","qqq":-0.0549,"spy":-0.486,"ndx":-0.05},{"date":"2023-03-24","qqq":0.5076,"spy":0.9979,"ndx":0.5239},{"date":"2023-03-27","qqq":-0.9114,"spy":-0.4094,"ndx":-0.9754},{"date":"2023-03-28","qqq":-0.3407,"spy":-0.0429,"ndx":-0.3504},{"date":"2023-03-29","qqq":0.5919,"spy":0.3551,"ndx":0.61},{"date":"2023-03-30","qqq":0.1396,"spy":-0.0965,"ndx":0.2176},{"date":"2023-03-31","qqq":1.5891,"spy":1.1689,"ndx":1.6377},{"date":"2023-04-03","qqq":0.4329,"spy":0.5136,"ndx":0.4911},{"date":"2023-04-04","qqq":-0.4772,"spy":-0.7167,"ndx":-0.4955},{"date":"2023-04-05","qqq":-0.6853,"spy":-0.076,"ndx":-0.6862},{"date":"2023-04-06","qqq":1.2124,"spy":0.5949,"ndx":1.3162},{"date":"2023-04-10","qqq":0.8887,"spy":0.7378,"ndx":0.8867},{"date":"2023-04-11","qqq":-0.6293,"spy":-0.1316,"ndx":-0.5854},{"date":"2023-04-12","qqq":-1.504,"spy":-0.9275,"ndx":-1.4997},{"date":"2023-04-13","qqq":1.3785,"spy":1.0484,"ndx":1.4431},{"date":"2023-04-14","qqq":0.3086,"spy":-0.0848,"ndx":0.267},{"date":"2023-04-17","qqq":0.2169,"spy":0.3807,"ndx":0.2639},{"date":"2023-04-18","qqq":-0.6636,"spy":-0.3297,"ndx":-0.6716},{"date":"2023-04-19","qqq":0.7269,"spy":0.4658,"ndx":0.7404},{"date":"2023-04-20","qqq":0.1869,"spy":0.1629,"ndx":0.1828},{"date":"2023-04-21","qqq":0.2216,"spy":0.0024,"ndx":0.2348},{"date":"2023-04-24","qqq":-0.1359,"spy":0.1553,"ndx":-0.0921},{"date":"2023-04-25","qqq":-1.3682,"spy":-1.096,"ndx":-1.3946},{"date":"2023-04-26","qqq":-0.5009,"spy":-0.5803,"ndx":-0.4676},{"date":"2023-04-27","qqq":1.4729,"spy":1.3292,"ndx":1.5183},{"date":"2023-04-28","qqq":0.7654,"spy":1.079,"ndx":0.8116},{"date":"2023-05-01","qqq":0.031,"spy":0.0096,"ndx":0.0178},{"date":"2023-05-02","qqq":-0.8506,"spy":-0.9475,"ndx":-0.8455},{"date":"2023-05-03","qqq":-0.7693,"spy":-0.8119,"ndx":-0.7078,"et":"Fed","en":"FOMC +25bps (may be last)","ed":"Fed raised 25bps, language shifted \u2014 possibly final hike of cycle"},{"date":"2023-05-04","qqq":-0.2807,"spy":-0.4423,"ndx":-0.2427},{"date":"2023-05-05","qqq":1.3879,"spy":0.9097,"ndx":1.4416},{"date":"2023-05-08","qqq":0.3939,"spy":-0.0557,"ndx":0.3363},{"date":"2023-05-09","qqq":-0.1118,"spy":-0.0486,"ndx":-0.2081},{"date":"2023-05-10","qqq":0.3147,"spy":-0.2489,"ndx":0.2962},{"date":"2023-05-11","qqq":0.1535,"spy":0.0437,"ndx":0.0967},{"date":"2023-05-12","qqq":-0.5233,"spy":-0.4427,"ndx":-0.4985},{"date":"2023-05-15","qqq":0.3932,"spy":0.1916,"ndx":0.4587},{"date":"2023-05-16","qqq":0.3374,"spy":-0.3909,"ndx":0.3036},{"date":"2023-05-17","qqq":0.8774,"spy":0.6984,"ndx":0.8515},{"date":"2023-05-18","qqq":1.7344,"spy":1.0436,"ndx":1.6582},{"date":"2023-05-19","qqq":-0.2904,"spy":-0.3689,"ndx":-0.2832},{"date":"2023-05-22","qqq":0.4134,"spy":0.0358,"ndx":0.3217},{"date":"2023-05-23","qqq":-0.7532,"spy":-0.7169,"ndx":-0.7343},{"date":"2023-05-24","qqq":0.0845,"spy":-0.3225,"ndx":0.1138},{"date":"2023-05-25","qqq":0.171,"spy":-0.0217,"ndx":0.1267,"et":"Earnings","en":"NVIDIA AI guidance shock (Q1 FY2024)","ed":"NVDA guided Q2 revenue to $11B vs $7.2B expected; AI infrastructure supercycle declared"},{"date":"2023-05-26","qqq":2.242,"spy":1.1292,"ndx":2.2005},{"date":"2023-05-30","qqq":-0.774,"spy":-0.4384,"ndx":-0.7646},{"date":"2023-05-31","qqq":-0.1091,"spy":-0.1028,"ndx":-0.2761},{"date":"2023-06-01","qqq":1.2308,"spy":0.8922,"ndx":1.2083},{"date":"2023-06-02","qqq":0.2403,"spy":0.8057,"ndx":0.2036},{"date":"2023-06-05","qqq":0.1326,"spy":-0.2755,"ndx":0.0438},{"date":"2023-06-06","qqq":0.1581,"spy":0.3187,"ndx":0.2202},{"date":"2023-06-07","qqq":-1.7768,"spy":-0.4411,"ndx":-1.8526},{"date":"2023-06-08","qqq":1.1543,"spy":0.5883,"ndx":1.1544},{"date":"2023-06-09","qqq":-0.0367,"spy":-0.014,"ndx":-0.3148},{"date":"2023-06-12","qqq":1.2072,"spy":0.6683,"ndx":1.1421},{"date":"2023-06-13","qqq":-0.0083,"spy":0.3078,"ndx":-0.0698},{"date":"2023-06-14","qqq":0.724,"spy":0.0389,"ndx":0.7492,"et":"Fed","en":"FOMC HOLD \u2014 first pause","ed":"Fed held rates for first time in 15 months; dot plot still hawkish"},{"date":"2023-06-15","qqq":1.5496,"spy":1.437,"ndx":1.5772},{"date":"2023-06-16","qqq":-1.2851,"spy":-0.8036,"ndx":-1.2357},{"date":"2023-06-20","qqq":0.2596,"spy":-0.0617,"ndx":0.2239},{"date":"2023-06-21","qqq":-1.0499,"spy":-0.2797,"ndx":-1.0091},{"date":"2023-06-22","qqq":1.5362,"spy":0.5899,"ndx":1.6518},{"date":"2023-06-23","qqq":0.0911,"spy":0.0647,"ndx":0.0823},{"date":"2023-06-26","qqq":-1.1934,"spy":-0.2728,"ndx":-1.1949},{"date":"2023-06-27","qqq":1.2749,"spy":0.8835,"ndx":1.3174},{"date":"2023-06-28","qqq":0.7072,"spy":0.308,"ndx":0.5937},{"date":"2023-06-29","qqq":-0.1181,"spy":0.4932,"ndx":-0.1711},{"date":"2023-06-30","qqq":0.5088,"spy":0.4168,"ndx":0.6229},{"date":"2023-07-03","qqq":0.0594,"spy":0.1964,"ndx":0.1195},{"date":"2023-07-05","qqq":0.4285,"spy":0.2761,"ndx":0.2533},{"date":"2023-07-06","qqq":0.2592,"spy":0.0546,"ndx":0.2348},{"date":"2023-07-07","qqq":-0.2696,"spy":-0.0182,"ndx":-0.2233},{"date":"2023-07-10","qqq":0.1093,"spy":0.3378,"ndx":0.0911},{"date":"2023-07-11","qqq":0.3762,"spy":0.4563,"ndx":0.338},{"date":"2023-07-12","qqq":0.1289,"spy":-0.0829,"ndx":0.1825},{"date":"2023-07-13","qqq":0.8244,"spy":0.3706,"ndx":0.9039},{"date":"2023-07-14","qqq":-0.137,"spy":-0.2664,"ndx":-0.2844},{"date":"2023-07-17","qqq":0.7399,"spy":0.3807,"ndx":0.6727},{"date":"2023-07-18","qqq":0.9896,"spy":0.8191,"ndx":1.0824,"et":"AI","en":"Meta releases Llama 2 (open source)","ed":"Meta open-sourced Llama 2; democratized AI; challenged OpenAI's moat"},{"date":"2023-07-19","qqq":-0.3025,"spy":0.0418,"ndx":-0.389},{"date":"2023-07-20","qqq":-1.529,"spy":-0.4382,"ndx":-1.6006},{"date":"2023-07-21","qqq":-0.9362,"spy":-0.3921,"ndx":-0.8311},{"date":"2023-07-24","qqq":-0.1035,"spy":0.1831,"ndx":-0.1753},{"date":"2023-07-25","qqq":0.4855,"spy":0.3349,"ndx":0.5061},{"date":"2023-07-26","qqq":-0.053,"spy":0.2288,"ndx":-0.0953,"et":"Fed","en":"FOMC +25bps","ed":"Fed raised again; signaled data-dependent future"},{"date":"2023-07-27","qqq":-1.6838,"spy":-1.4226,"ndx":-1.7103},{"date":"2023-07-28","qqq":0.7197,"spy":0.2281,"ndx":0.7726},{"date":"2023-07-31","qqq":-0.0287,"spy":0.0831,"ndx":-0.1097},{"date":"2023-08-01","qqq":0.1256,"spy":0.046,"ndx":0.134},{"date":"2023-08-02","qqq":-1.2841,"spy":-0.6884,"ndx":-1.2236},{"date":"2023-08-03","qqq":0.4974,"spy":0.1786,"ndx":0.4302},{"date":"2023-08-04","qqq":-0.9874,"spy":-0.8675,"ndx":-0.9456},{"date":"2023-08-07","qqq":0.3504,"spy":0.4457,"ndx":0.3401},{"date":"2023-08-08","qqq":-0.1718,"spy":0.1495,"ndx":-0.0416},{"date":"2023-08-09","qqq":-1.1765,"spy":-0.7305,"ndx":-1.212},{"date":"2023-08-10","qqq":-0.6416,"spy":-0.5087,"ndx":-0.5812},{"date":"2023-08-11","qqq":0.0683,"spy":0.3784,"ndx":0.1169},{"date":"2023-08-14","qqq":1.3464,"spy":0.7668,"ndx":1.4489},{"date":"2023-08-15","qqq":-0.796,"spy":-0.7574,"ndx":-0.886},{"date":"2023-08-16","qqq":-0.9102,"spy":-0.6373,"ndx":-0.9663},{"date":"2023-08-17","qqq":-1.4782,"spy":-1.1039,"ndx":-1.5226},{"date":"2023-08-18","qqq":0.8079,"spy":0.7222,"ndx":0.7206},{"date":"2023-08-21","qqq":1.1901,"spy":0.4091,"ndx":1.1833},{"date":"2023-08-22","qqq":-0.8648,"spy":-0.6868,"ndx":-0.8388},{"date":"2023-08-23","qqq":1.2425,"spy":0.8606,"ndx":1.3412,"et":"Earnings","en":"NVIDIA Q2 FY2024 beat","ed":"NVDA revenue $13.5B vs $11.2B expected; data center explosive; stock jumped ~9%"},{"date":"2023-08-24","qqq":-3.0646,"spy":-1.754,"ndx":-3.027},{"date":"2023-08-25","qqq":0.5386,"spy":0.2941,"ndx":0.5579,"et":"Fed","en":"Jackson Hole \u2014 Powell hawkish","ed":"Powell: 'we are prepared to raise rates further'; more work to do"},{"date":"2023-08-28","qqq":-0.0627,"spy":0.1176,"ndx":0.1129},{"date":"2023-08-29","qqq":2.2397,"spy":1.4707,"ndx":2.2172},{"date":"2023-08-30","qqq":0.5282,"spy":0.3337,"ndx":0.4924},{"date":"2023-08-31","qqq":0.2786,"spy":-0.2878,"ndx":0.1657},{"date":"2023-09-01","qqq":-0.7387,"spy":-0.4369,"ndx":-0.7057},{"date":"2023-09-05","qqq":0.345,"spy":-0.3306,"ndx":0.3087},{"date":"2023-09-06","qqq":-0.6732,"spy":-0.4862,"ndx":-0.6199},{"date":"2023-09-07","qqq":0.4997,"spy":0.3927,"ndx":0.5555},{"date":"2023-09-08","qqq":0.1532,"spy":0.1394,"ndx":0.096},{"date":"2023-09-11","qqq":0.3487,"spy":0.0469,"ndx":0.3381},{"date":"2023-09-12","qqq":-0.6609,"spy":-0.2148,"ndx":-0.6553},{"date":"2023-09-13","qqq":0.3163,"spy":0.065,"ndx":0.3613},{"date":"2023-09-14","qqq":0.3404,"spy":0.2873,"ndx":0.2649,"et":"IPO","en":"ARM Holdings IPO","ed":"ARM priced at $51, raised $4.87B \u2014 biggest tech IPO since 2021; chip designer for smartphones"},{"date":"2023-09-15","qqq":-1.3567,"spy":-0.8431,"ndx":-1.4492},{"date":"2023-09-18","qqq":0.3628,"spy":0.1309,"ndx":0.4235},{"date":"2023-09-19","qqq":0.1489,"spy":0.0068,"ndx":0.2554,"et":"IPO","en":"Instacart (CART) IPO","ed":"CART priced at $30; first major consumer tech IPO of 2023 post-cycle"},{"date":"2023-09-20","qqq":-1.728,"spy":-1.2094,"ndx":-1.6776,"et":"IPO","en":"Klaviyo (KVYO) IPO","ed":"Marketing automation SaaS; priced at $30; solid debut signaling B2B SaaS recovery"},{"date":"2023-09-21","qqq":-0.8149,"spy":-0.9892,"ndx":-0.805},{"date":"2023-09-22","qqq":-0.4783,"spy":-0.4694,"ndx":-0.3762},{"date":"2023-09-25","qqq":0.7508,"spy":0.713,"ndx":0.7244},{"date":"2023-09-26","qqq":-0.7787,"spy":-0.7481,"ndx":-0.8359},{"date":"2023-09-27","qqq":-0.0957,"spy":-0.2435,"ndx":-0.1368},{"date":"2023-09-28","qqq":1.1014,"spy":0.7145,"ndx":1.1824},{"date":"2023-09-29","qqq":-0.9045,"spy":-0.9706,"ndx":-0.9298},{"date":"2023-10-02","qqq":0.7586,"spy":0.1617,"ndx":0.8131},{"date":"2023-10-03","qqq":-1.0759,"spy":-0.8164,"ndx":-1.2102},{"date":"2023-10-04","qqq":1.1187,"spy":0.6136,"ndx":1.1156},{"date":"2023-10-05","qqq":-0.2919,"spy":0.033,"ndx":-0.3137},{"date":"2023-10-06","qqq":2.5446,"spy":1.794,"ndx":2.4005,"et":"Macro","en":"Jobs Report (Sep) \u2014 big beat","ed":"Nonfarm payrolls +336K vs 170K expected; strong economy signal"},{"date":"2023-10-09","qqq":1.1758,"spy":1.1016,"ndx":1.1806},{"date":"2023-10-10","qqq":0.4606,"spy":0.3696,"ndx":0.3813},{"date":"2023-10-11","qqq":0.346,"spy":0.1561,"ndx":0.3066,"et":"IPO","en":"Birkenstock (BIRK) IPO","ed":"Birkenstock priced at $46; debut was flat/down \u2014 luxury consumer weakness"},{"date":"2023-10-12","qqq":-0.4842,"spy":-0.7529,"ndx":-0.5242},{"date":"2023-10-13","qqq":-1.4275,"spy":-0.8525,"ndx":-1.5146},{"date":"2023-10-16","qqq":0.761,"spy":0.5117,"ndx":0.7855},{"date":"2023-10-17","qqq":0.6533,"spy":0.7417,"ndx":0.7512},{"date":"2023-10-18","qqq":-0.629,"spy":-0.9167,"ndx":-0.7524},{"date":"2023-10-19","qqq":-1.3267,"spy":-1.0489,"ndx":-1.3217},{"date":"2023-10-20","qqq":-1.352,"spy":-1.1245,"ndx":-1.2995},{"date":"2023-10-23","qqq":0.6822,"spy":0.2026,"ndx":0.6252},{"date":"2023-10-24","qqq":0.4531,"spy":0.2319,"ndx":0.4595},{"date":"2023-10-25","qqq":-1.783,"spy":-1.0287,"ndx":-1.7787},{"date":"2023-10-26","qqq":-1.5639,"spy":-0.9365,"ndx":-1.4282},{"date":"2023-10-27","qqq":-0.3233,"spy":-0.8474,"ndx":-0.4586},{"date":"2023-10-30","qqq":0.3939,"spy":0.4909,"ndx":0.3607},{"date":"2023-10-31","qqq":0.4696,"spy":0.4854,"ndx":0.4806},{"date":"2023-11-01","qqq":1.4898,"spy":0.8254,"ndx":1.4614,"et":"Fed","en":"FOMC HOLD","ed":"Fed held; Treasury refunding announcement less bad than feared \u2014 rates rallied"},{"date":"2023-11-02","qqq":0.5255,"spy":0.9799,"ndx":0.4213},{"date":"2023-11-03","qqq":0.8115,"spy":0.3578,"ndx":0.7632},{"date":"2023-11-06","qqq":0.1954,"spy":0.0505,"ndx":0.1174},{"date":"2023-11-07","qqq":0.6563,"spy":0.2846,"ndx":0.62},{"date":"2023-11-08","qqq":-0.0375,"spy":-0.0686,"ndx":-0.0043},{"date":"2023-11-09","qqq":-0.9555,"spy":-1.0469,"ndx":-1.0632},{"date":"2023-11-10","qqq":1.767,"spy":1.062,"ndx":1.8145},{"date":"2023-11-13","qqq":0.1115,"spy":0.2186,"ndx":0.0878},{"date":"2023-11-14","qqq":0.4222,"spy":0.54,"ndx":0.4326},{"date":"2023-11-15","qqq":-0.4209,"spy":-0.0955,"ndx":-0.4064},{"date":"2023-11-16","qqq":0.2884,"spy":0.2248,"ndx":0.4311},{"date":"2023-11-17","qqq":0.2155,"spy":0.1222,"ndx":0.2152},{"date":"2023-11-20","qqq":1.2149,"spy":0.8279,"ndx":1.1477},{"date":"2023-11-21","qqq":-0.1388,"spy":0.0199,"ndx":-0.1124},{"date":"2023-11-22","qqq":-0.1306,"spy":0.0088,"ndx":-0.1519},{"date":"2023-11-24","qqq":-0.0359,"spy":0.0505,"ndx":0.0448},{"date":"2023-11-27","qqq":0.0411,"spy":-0.0374,"ndx":-0.0485},{"date":"2023-11-28","qqq":0.4583,"spy":0.1872,"ndx":0.44},{"date":"2023-11-29","qqq":-0.7334,"spy":-0.5556,"ndx":-0.7682},{"date":"2023-11-30","qqq":-0.3204,"spy":0.202,"ndx":-0.2489},{"date":"2023-12-01","qqq":0.5648,"spy":0.7306,"ndx":0.6606},{"date":"2023-12-04","qqq":0.0596,"spy":0.2392,"ndx":0.0161},{"date":"2023-12-05","qqq":0.7544,"spy":0.2943,"ndx":0.7236},{"date":"2023-12-06","qqq":-1.3375,"spy":-0.8827,"ndx":-1.2642},{"date":"2023-12-07","qqq":0.6081,"spy":0.2889,"ndx":0.845},{"date":"2023-12-08","qqq":0.9005,"spy":0.599,"ndx":0.8264},{"date":"2023-12-11","qqq":0.9649,"spy":0.5003,"ndx":0.9466},{"date":"2023-12-12","qqq":0.7862,"spy":0.5351,"ndx":0.8923},{"date":"2023-12-13","qqq":1.031,"spy":1.2939,"ndx":1.0382,"et":"Fed","en":"FOMC HOLD \u2014 dovish pivot","ed":"Fed projected 3 cuts in 2024; dot plot dovish surprise; Santa rally ignited"},{"date":"2023-12-14","qqq":-0.3926,"spy":-0.1037,"ndx":-0.3958},{"date":"2023-12-15","qqq":0.287,"spy":-0.0341,"ndx":0.2197},{"date":"2023-12-18","qqq":0.531,"spy":0.2102,"ndx":0.5934},{"date":"2023-12-19","qqq":0.3975,"spy":0.4889,"ndx":0.4637},{"date":"2023-12-20","qqq":-1.2906,"spy":-1.2026,"ndx":-1.2496},{"date":"2023-12-21","qqq":0.1744,"spy":0.2907,"ndx":0.2261},{"date":"2023-12-22","qqq":-0.1516,"spy":-0.0443,"ndx":-0.1287},{"date":"2023-12-26","qqq":0.3983,"spy":0.3333,"ndx":0.3668},{"date":"2023-12-27","qqq":0.1338,"spy":0.2251,"ndx":0.0631},{"date":"2023-12-28","qqq":-0.332,"spy":-0.0398,"ndx":-0.3835},{"date":"2023-12-29","qqq":-0.4279,"spy":-0.2476,"ndx":-0.4527},{"date":"2024-01-02","qqq":-0.8008,"spy":0.1038,"ndx":-0.7401},{"date":"2024-01-03","qqq":-0.4001,"spy":-0.3486,"ndx":-0.2728},{"date":"2024-01-04","qqq":-0.0404,"spy":-0.2178,"ndx":-0.0538},{"date":"2024-01-05","qqq":0.0757,"spy":0.092,"ndx":0.1489},{"date":"2024-01-08","qqq":1.7488,"spy":1.3172,"ndx":1.8078},{"date":"2024-01-09","qqq":0.9554,"spy":0.426,"ndx":0.8876},{"date":"2024-01-10","qqq":0.5984,"spy":0.5062,"ndx":0.5418},{"date":"2024-01-11","qqq":-0.1074,"spy":-0.2596,"ndx":-0.1857},{"date":"2024-01-12","qqq":-0.2047,"spy":-0.2428,"ndx":-0.131},{"date":"2024-01-16","qqq":0.2963,"spy":-0.0694,"ndx":0.3315},{"date":"2024-01-17","qqq":0.256,"spy":0.0996,"ndx":0.1842},{"date":"2024-01-18","qqq":0.6017,"spy":0.5232,"ndx":0.5206},{"date":"2024-01-19","qqq":1.4354,"spy":1.0007,"ndx":1.488},{"date":"2024-01-22","qqq":-0.3968,"spy":-0.1157,"ndx":-0.4208},{"date":"2024-01-23","qqq":0.2486,"spy":0.1756,"ndx":0.3301},{"date":"2024-01-24","qqq":-0.3767,"spy":-0.4961,"ndx":-0.3588},{"date":"2024-01-25","qqq":-0.4692,"spy":0.0923,"ndx":-0.4109},{"date":"2024-01-26","qqq":-0.1484,"spy":-0.0369,"ndx":-0.068},{"date":"2024-01-29","qqq":0.9145,"spy":0.7258,"ndx":0.9074},{"date":"2024-01-30","qqq":-0.4215,"spy":0.0673,"ndx":-0.4544},{"date":"2024-01-31","qqq":-0.9219,"spy":-1.1747,"ndx":-0.7686,"et":"Fed","en":"FOMC HOLD \u2014 cut hopes delayed","ed":"Powell pushed back on March cut expectations"},{"date":"2024-02-01","qqq":0.7378,"spy":0.943,"ndx":0.7418},{"date":"2024-02-02","qqq":1.2294,"spy":0.9599,"ndx":1.3022},{"date":"2024-02-05","qqq":-0.1445,"spy":-0.2329,"ndx":-0.1228},{"date":"2024-02-06","qqq":-0.4702,"spy":0.0932,"ndx":-0.5192},{"date":"2024-02-07","qqq":0.3671,"spy":0.3647,"ndx":0.4553},{"date":"2024-02-08","qqq":0.1574,"spy":0.0442,"ndx":0.144},{"date":"2024-02-09","qqq":0.7167,"spy":0.4731,"ndx":0.7936},{"date":"2024-02-12","qqq":-0.3662,"spy":-0.0379,"ndx":-0.3323},{"date":"2024-02-13","qqq":0.2972,"spy":-0.091,"ndx":0.4602,"et":"Macro","en":"Hot CPI print","ed":"CPI +3.1% vs 2.9% exp; 10yr yields spiked; rate cut bets pushed to June"},{"date":"2024-02-14","qqq":0.4545,"spy":0.3583,"ndx":0.4441},{"date":"2024-02-15","qqq":0.136,"spy":0.5448,"ndx":0.1706,"et":"AI","en":"OpenAI Sora revealed","ed":"OpenAI revealed Sora video generation; Adobe/Getty concerns; creative AI wave"},{"date":"2024-02-16","qqq":-0.9934,"spy":-0.4365,"ndx":-0.9388},{"date":"2024-02-20","qqq":-0.287,"spy":-0.1929,"ndx":-0.2562},{"date":"2024-02-21","qqq":0.2497,"spy":0.3613,"ndx":0.3797,"et":"Earnings","en":"NVIDIA Q4 FY2024 blowout","ed":"NVDA revenue $22.1B vs $20.4B exp; market cap surpassed $2T; AI narrative solidified"},{"date":"2024-02-22","qqq":0.824,"spy":0.6924,"ndx":0.8228},{"date":"2024-02-23","qqq":-0.6528,"spy":-0.2788,"ndx":-0.6369},{"date":"2024-02-26","qqq":-0.2399,"spy":-0.4545,"ndx":-0.2052},{"date":"2024-02-27","qqq":-0.016,"spy":0.0454,"ndx":0.0472},{"date":"2024-02-28","qqq":-0.0367,"spy":0.184,"ndx":-0.1147},{"date":"2024-02-29","qqq":0.1757,"spy":0.002,"ndx":0.29,"et":"IPO","en":"Reddit (RDDT) S-1 filed","ed":"Reddit filed S-1; first major social media IPO since 2019; OpenAI partnership highlighted"},{"date":"2024-03-01","qqq":1.298,"spy":0.7603,"ndx":1.2929},{"date":"2024-03-04","qqq":-0.3568,"spy":0.0527,"ndx":-0.3478},{"date":"2024-03-05","qqq":-1.109,"spy":-0.5997,"ndx":-1.055},{"date":"2024-03-06","qqq":-0.3475,"spy":-0.1567,"ndx":-0.3646},{"date":"2024-03-07","qqq":0.6849,"spy":0.3254,"ndx":0.7503},{"date":"2024-03-08","qqq":-1.5231,"spy":-0.7256,"ndx":-1.6073},{"date":"2024-03-11","qqq":-0.0274,"spy":0.1567,"ndx":-0.0445},{"date":"2024-03-12","qqq":0.8937,"spy":0.6486,"ndx":0.8641},{"date":"2024-03-13","qqq":-0.5422,"spy":-0.2205,"ndx":-0.4588},{"date":"2024-03-14","qqq":-0.5345,"spy":-0.3907,"ndx":-0.5514},{"date":"2024-03-15","qqq":-0.493,"spy":-0.0745,"ndx":-0.662},{"date":"2024-03-18","qqq":-0.2849,"spy":-0.2218,"ndx":-0.2177},{"date":"2024-03-19","qqq":0.7165,"spy":0.6951,"ndx":0.7244},{"date":"2024-03-20","qqq":0.9073,"spy":0.9132,"ndx":0.9542,"et":"IPO","en":"Astera Labs (ALAB) IPO","ed":"AI connectivity chipmaker priced at $36; soared 72% on Day 1 \u2014 AI infrastructure hype peak"},{"date":"2024-03-21","qqq":-0.6706,"spy":-0.2274,"ndx":-0.6392,"et":"IPO","en":"Reddit (RDDT) IPO","ed":"Reddit priced at $34; surged ~50% on debut; retail momentum + OpenAI licensing deal"},{"date":"2024-03-22","qqq":0.2313,"spy":-0.1724,"ndx":0.253},{"date":"2024-03-25","qqq":0.2728,"spy":-0.0058,"ndx":0.3377},{"date":"2024-03-26","qqq":-0.6677,"spy":-0.4643,"ndx":-0.6479},{"date":"2024-03-27","qqq":-0.3606,"spy":0.2798,"ndx":-0.3127},{"date":"2024-03-28","qqq":-0.1731,"spy":-0.0268,"ndx":-0.0477},{"date":"2024-04-01","qqq":-0.0045,"spy":-0.3188,"ndx":0.0677},{"date":"2024-04-02","qqq":0.234,"spy":0.1158,"ndx":0.2509},{"date":"2024-04-03","qqq":0.7153,"spy":0.3264,"ndx":0.5857},{"date":"2024-04-04","qqq":-2.4623,"spy":-1.9961,"ndx":-2.4671},{"date":"2024-04-05","qqq":0.8448,"spy":0.7717,"ndx":0.9375},{"date":"2024-04-08","qqq":-0.1835,"spy":-0.0828,"ndx":-0.1668},{"date":"2024-04-09","qqq":-0.1648,"spy":-0.2267,"ndx":-0.1043},{"date":"2024-04-10","qqq":0.3135,"spy":0.1246,"ndx":0.299,"et":"Macro","en":"Hot CPI \u2014 cuts pushed to Sept","ed":"CPI +3.5% YoY; June cut odds collapsed; 10yr hit 4.6%"},{"date":"2024-04-11","qqq":1.1607,"spy":0.4499,"ndx":1.2323},{"date":"2024-04-12","qqq":-0.6416,"spy":-0.6843,"ndx":-0.6302},{"date":"2024-04-15","qqq":-2.4884,"spy":-2.0733,"ndx":-2.4054},{"date":"2024-04-16","qqq":0.0464,"spy":-0.2792,"ndx":0.1255},{"date":"2024-04-17","qqq":-1.6763,"spy":-1.0868,"ndx":-1.6429},{"date":"2024-04-18","qqq":-0.7222,"spy":-0.4901,"ndx":-0.6878},{"date":"2024-04-19","qqq":-1.7929,"spy":-0.857,"ndx":-1.7137,"et":"Geopolitical","en":"Israel strikes Iran","ed":"Israel's retaliatory strike on Iran; escalation fears spiked then quickly faded"},{"date":"2024-04-22","qqq":0.3618,"spy":0.3797,"ndx":0.2901},{"date":"2024-04-23","qqq":1.0219,"spy":0.7713,"ndx":1.0073},{"date":"2024-04-24","qqq":-0.3947,"spy":-0.227,"ndx":-0.4931},{"date":"2024-04-25","qqq":1.2427,"spy":0.8634,"ndx":1.309,"et":"IPO","en":"Rubrik (RBRK) IPO","ed":"Cybersecurity/data security; priced at $32; strong debut in AI-adjacent security"},{"date":"2024-04-26","qqq":0.7904,"spy":0.3772,"ndx":0.8658},{"date":"2024-04-29","qqq":-0.0877,"spy":-0.0059,"ndx":-0.1035},{"date":"2024-04-30","qqq":-1.5215,"spy":-1.2938,"ndx":-1.5782},{"date":"2024-05-01","qqq":-0.3852,"spy":-0.2054,"ndx":-0.3695,"et":"IPO","en":"Viking Holdings (VIK) IPO","ed":"Luxury cruise line; priced at $24; solid debut as travel demand remained strong"},{"date":"2024-05-02","qqq":0.3762,"spy":0.1746,"ndx":0.3812},{"date":"2024-05-03","qqq":0.2394,"spy":0.0254,"ndx":0.2361},{"date":"2024-05-06","qqq":0.6746,"spy":0.5489,"ndx":0.7943},{"date":"2024-05-07","qqq":-0.0862,"spy":-0.0811,"ndx":-0.0822},{"date":"2024-05-08","qqq":0.5461,"spy":0.3746,"ndx":0.541},{"date":"2024-05-09","qqq":0.1567,"spy":0.5393,"ndx":0.0976},{"date":"2024-05-10","qqq":-0.1085,"spy":-0.1859,"ndx":-0.0549},{"date":"2024-05-13","qqq":-0.205,"spy":-0.3158,"ndx":-0.1634,"et":"AI","en":"OpenAI GPT-4o launched","ed":"GPT-4o native multimodal; real-time voice; GOOGL I/O competition same week"},{"date":"2024-05-14","qqq":0.741,"spy":0.4203,"ndx":0.7437},{"date":"2024-05-15","qqq":0.9968,"spy":0.7512,"ndx":0.9984},{"date":"2024-05-16","qqq":-0.1612,"spy":-0.2246,"ndx":-0.1722},{"date":"2024-05-17","qqq":-0.0774,"spy":0.121,"ndx":-0.1378},{"date":"2024-05-20","qqq":0.6483,"spy":0.0925,"ndx":0.6195},{"date":"2024-05-21","qqq":0.6092,"spy":0.393,"ndx":0.5903},{"date":"2024-05-22","qqq":-0.0767,"spy":-0.1545,"ndx":-0.1513,"et":"Earnings","en":"NVIDIA Q1 FY2025 beat","ed":"NVDA revenue $26B vs $24.6B exp; announced 10-for-1 stock split; Blackwell confirmed"},{"date":"2024-05-23","qqq":-1.496,"spy":-1.3134,"ndx":-1.5008},{"date":"2024-05-24","qqq":0.5842,"spy":0.3012,"ndx":0.7445},{"date":"2024-05-28","qqq":0.1089,"spy":-0.0868,"ndx":0.0758},{"date":"2024-05-29","qqq":0.2108,"spy":0.0799,"ndx":0.1533},{"date":"2024-05-30","qqq":-0.8672,"spy":-0.3641,"ndx":-0.7739},{"date":"2024-05-31","qqq":-0.2368,"spy":0.7219,"ndx":-0.0763},{"date":"2024-06-03","qqq":-0.3168,"spy":-0.2306,"ndx":-0.3522},{"date":"2024-06-04","qqq":0.3312,"spy":0.3666,"ndx":0.3056},{"date":"2024-06-05","qqq":1.2118,"spy":0.7348,"ndx":1.2973},{"date":"2024-06-06","qqq":-0.1831,"spy":-0.0598,"ndx":-0.167},{"date":"2024-06-07","qqq":-0.0086,"spy":0.0656,"ndx":0.0441},{"date":"2024-06-10","qqq":0.6518,"spy":0.4651,"ndx":0.6828,"et":"AI","en":"Apple Intelligence announced at WWDC","ed":"Apple announced AI integration with ChatGPT partnership; AAPL +7% \u2014 AI demand for iPhones"},{"date":"2024-06-11","qqq":0.9665,"spy":0.5393,"ndx":0.9394},{"date":"2024-06-12","qqq":0.4576,"spy":-0.0499,"ndx":0.5523,"et":"Fed","en":"FOMC HOLD \u2014 1 cut projected","ed":"Dot plot cut to 1 cut in 2024 (from 3); hawkish surprise"},{"date":"2024-06-13","qqq":-0.2093,"spy":-0.1289,"ndx":-0.1639},{"date":"2024-06-14","qqq":0.5603,"spy":0.3513,"ndx":0.5245,"et":"IPO","en":"Golden Age of IPOs narrative","ed":"Fed hold + strong market sets stage for IPO window reopening H2 2024"},{"date":"2024-06-17","qqq":1.168,"spy":0.9261,"ndx":1.1223},{"date":"2024-06-18","qqq":0.0412,"spy":0.2431,"ndx":0.0223},{"date":"2024-06-20","qqq":-1.0176,"spy":-0.4441,"ndx":-1.0553,"et":"IPO","en":"Lineage (LINE) IPO","ed":"Cold storage REIT; raised $4.4B \u2014 largest REIT IPO ever; priced above range"},{"date":"2024-06-21","qqq":-0.2099,"spy":0.0202,"ndx":-0.1112},{"date":"2024-06-24","qqq":-0.8825,"spy":-0.2921,"ndx":-0.8836},{"date":"2024-06-25","qqq":0.6953,"spy":0.1544,"ndx":0.743},{"date":"2024-06-26","qqq":0.3803,"spy":0.3348,"ndx":0.4066},{"date":"2024-06-27","qqq":0.3103,"spy":0.1834,"ndx":0.2457},{"date":"2024-06-28","qqq":-0.6841,"spy":-0.5373,"ndx":-0.6768},{"date":"2024-07-01","qqq":0.3916,"spy":-0.0531,"ndx":0.4671},{"date":"2024-07-02","qqq":1.3676,"spy":0.9766,"ndx":1.3454},{"date":"2024-07-03","qqq":0.9913,"spy":0.5048,"ndx":0.957},{"date":"2024-07-05","qqq":0.8681,"spy":0.5201,"ndx":0.8299},{"date":"2024-07-08","qqq":0.1631,"spy":-0.0288,"ndx":0.2238},{"date":"2024-07-09","qqq":-0.2205,"spy":-0.0791,"ndx":-0.2495},{"date":"2024-07-10","qqq":0.6504,"spy":0.7629,"ndx":0.6921},{"date":"2024-07-11","qqq":-2.2144,"spy":-0.8834,"ndx":-2.1782,"et":"Macro","en":"CPI cool \u2014 rotation trade ignites","ed":"CPI +3.0% \u2014 in-line/soft; Russell 2000 +3.6%; mega-cap tech sold off hard (rotation)"},{"date":"2024-07-12","qqq":0.469,"spy":0.4232,"ndx":0.5204},{"date":"2024-07-15","qqq":-0.0926,"spy":-0.089,"ndx":-0.0693},{"date":"2024-07-16","qqq":-0.2572,"spy":0.3535,"ndx":-0.2099},{"date":"2024-07-17","qqq":-1.3333,"spy":-0.3329,"ndx":-1.2084,"et":"Macro","en":"Trump assassination attempt + Crowdstrike outage","ed":"Global IT outage from CrowdStrike update; ~8.5M Windows devices affected"},{"date":"2024-07-18","qqq":-1.244,"spy":-1.0474,"ndx":-1.1594},{"date":"2024-07-19","qqq":-0.816,"spy":-0.6209,"ndx":-0.839,"et":"Macro","en":"CrowdStrike global IT outage","ed":"Airlines, hospitals, banks grounded by CRWD faulty update; CRWD -11%"},{"date":"2024-07-22","qqq":0.2411,"spy":0.2984,"ndx":0.3638},{"date":"2024-07-23","qqq":-0.1641,"spy":-0.137,"ndx":-0.1465},{"date":"2024-07-24","qqq":-2.2034,"spy":-1.3902,"ndx":-2.276},{"date":"2024-07-25","qqq":-1.1753,"spy":-0.5431,"ndx":-1.1059},{"date":"2024-07-26","qqq":0.0692,"spy":0.3983,"ndx":0.1762},{"date":"2024-07-29","qqq":-0.3887,"spy":-0.2308,"ndx":-0.3291},{"date":"2024-07-30","qqq":-1.786,"spy":-0.7799,"ndx":-1.7423},{"date":"2024-07-31","qqq":0.684,"spy":0.3333,"ndx":0.7261},{"date":"2024-08-01","qqq":-2.5649,"spy":-1.7301,"ndx":-2.5061,"et":"Macro","en":"Sahm Rule triggered + Japan rate hike fears","ed":"Weak jobs report; Japan BoJ raised rates; yen carry trade unwind begins"},{"date":"2024-08-02","qqq":-0.4746,"spy":-0.532,"ndx":-0.2887},{"date":"2024-08-05","qqq":2.5099,"spy":1.1219,"ndx":2.584,"et":"Macro","en":"Japan carry trade collapse \u2014 Black Monday","ed":"Nikkei -12%; VIX hit 65; yen surged; global market selloff and bounce"},{"date":"2024-08-06","qqq":0.526,"spy":0.5643,"ndx":0.6484},{"date":"2024-08-07","qqq":-2.6249,"spy":-1.8563,"ndx":-2.606,"et":"Macro","en":"Carry trade volatility continues","ed":"Market re-tested lows as carry trade unwind continued"},{"date":"2024-08-08","qqq":1.5894,"spy":1.2865,"ndx":1.7223},{"date":"2024-08-09","qqq":0.8215,"spy":0.6002,"ndx":0.7576},{"date":"2024-08-12","qqq":-0.0022,"spy":-0.176,"ndx":-0.0334},{"date":"2024-08-13","qqq":1.483,"spy":1.027,"ndx":1.5038},{"date":"2024-08-14","qqq":-0.1683,"spy":0.1658,"ndx":-0.1107},{"date":"2024-08-15","qqq":1.2074,"spy":0.6497,"ndx":1.2378},{"date":"2024-08-16","qqq":0.5099,"spy":0.5241,"ndx":0.5919},{"date":"2024-08-19","qqq":1.2837,"spy":0.8797,"ndx":1.2527},{"date":"2024-08-20","qqq":-0.0187,"spy":-0.0805,"ndx":-0.0838},{"date":"2024-08-21","qqq":0.3014,"spy":0.1518,"ndx":0.3359},{"date":"2024-08-22","qqq":-2.0605,"spy":-1.127,"ndx":-2.1065},{"date":"2024-08-23","qqq":0.1586,"spy":0.4647,"ndx":0.2597},{"date":"2024-08-26","qqq":-0.8572,"spy":-0.4244,"ndx":-0.8273},{"date":"2024-08-27","qqq":0.6481,"spy":0.37,"ndx":0.6732},{"date":"2024-08-28","qqq":-1.0372,"spy":-0.5185,"ndx":-1.1073,"et":"Earnings","en":"NVIDIA Q2 FY2025 beat (muted reaction)","ed":"NVDA beat but Blackwell delay concerns; whisper numbers too high \u2014 stock flat/slightly down"},{"date":"2024-08-29","qqq":-0.5536,"spy":-0.3498,"ndx":-0.5139},{"date":"2024-08-30","qqq":0.2589,"spy":0.5189,"ndx":0.3505},{"date":"2024-09-03","qqq":-2.407,"spy":-1.4969,"ndx":-2.4661},{"date":"2024-09-04","qqq":0.423,"spy":0.1363,"ndx":0.4713},{"date":"2024-09-05","qqq":0.451,"spy":-0.2324,"ndx":0.3494},{"date":"2024-09-06","qqq":-2.5286,"spy":-1.742,"ndx":-2.5484,"et":"Macro","en":"Weak jobs report","ed":"Payrolls +142K vs 165K exp; recession fears re-emerge"},{"date":"2024-09-09","qqq":0.309,"spy":0.3231,"ndx":0.4358},{"date":"2024-09-10","qqq":0.5304,"spy":0.0784,"ndx":0.5715},{"date":"2024-09-11","qqq":1.8938,"spy":1.0425,"ndx":1.9681},{"date":"2024-09-12","qqq":0.9751,"spy":0.7351,"ndx":0.9703},{"date":"2024-09-13","qqq":0.6053,"spy":0.4109,"ndx":0.6109},{"date":"2024-09-16","qqq":0.0106,"spy":0.1958,"ndx":0.0529},{"date":"2024-09-17","qqq":-0.5879,"spy":-0.3592,"ndx":-0.5494},{"date":"2024-09-18","qqq":-0.6868,"spy":-0.4151,"ndx":-0.688,"et":"Fed","en":"FOMC \u2014 FIRST CUT: -50bps","ed":"Fed cut 50bps (jumbo) \u2014 larger than expected; first cut since March 2020"},{"date":"2024-09-19","qqq":0.1554,"spy":-0.0053,"ndx":0.2077},{"date":"2024-09-20","qqq":-0.0104,"spy":0.0722,"ndx":-0.1251},{"date":"2024-09-23","qqq":0.0186,"spy":0.058,"ndx":0.0176},{"date":"2024-09-24","qqq":0.1878,"spy":0.1437,"ndx":0.137},{"date":"2024-09-25","qqq":0.2228,"spy":-0.1926,"ndx":0.2526},{"date":"2024-09-26","qqq":-0.7905,"spy":-0.3621,"ndx":-0.7782},{"date":"2024-09-27","qqq":-0.7645,"spy":-0.3349,"ndx":-0.6882},{"date":"2024-09-30","qqq":0.4714,"spy":0.5855,"ndx":0.5082},{"date":"2024-10-01","qqq":-1.3184,"spy":-0.8336,"ndx":-1.3607},{"date":"2024-10-02","qqq":0.331,"spy":0.2026,"ndx":0.3885},{"date":"2024-10-03","qqq":0.3856,"spy":0.0811,"ndx":0.411},{"date":"2024-10-04","qqq":-0.0267,"spy":0.1101,"ndx":0.0492},{"date":"2024-10-07","qqq":-0.6778,"spy":-0.6126,"ndx":-0.7713},{"date":"2024-10-08","qqq":0.9574,"spy":0.4821,"ndx":1.0329},{"date":"2024-10-09","qqq":0.8487,"spy":0.6944,"ndx":0.8523},{"date":"2024-10-10","qqq":0.3545,"spy":0.0625,"ndx":0.3794,"et":"Macro","en":"CPI slightly hot","ed":"CPI +2.4% vs 2.3% exp; November cut odds fell briefly"},{"date":"2024-10-11","qqq":0.5339,"spy":0.6128,"ndx":0.5812},{"date":"2024-10-14","qqq":0.349,"spy":0.5334,"ndx":0.3584},{"date":"2024-10-15","qqq":-1.4021,"spy":-0.8228,"ndx":-1.3841},{"date":"2024-10-16","qqq":-0.055,"spy":0.4346,"ndx":0.0059},{"date":"2024-10-17","qqq":-1.0454,"spy":-0.6076,"ndx":-0.9073},{"date":"2024-10-18","qqq":0.083,"spy":0.089,"ndx":0.1753},{"date":"2024-10-21","qqq":0.4399,"spy":-0.0377,"ndx":0.3993},{"date":"2024-10-22","qqq":0.6555,"spy":0.3907,"ndx":0.659},{"date":"2024-10-23","qqq":-1.0596,"spy":-0.5626,"ndx":-1.1653},{"date":"2024-10-24","qqq":0.0427,"spy":-0.1276,"ndx":0.1745},{"date":"2024-10-25","qqq":0.0364,"spy":-0.4248,"ndx":-0.0142},{"date":"2024-10-28","qqq":-0.6139,"spy":-0.3004,"ndx":-0.5081},{"date":"2024-10-29","qqq":0.8957,"spy":0.3311,"ndx":0.8914},{"date":"2024-10-30","qqq":-0.6027,"spy":-0.2202,"ndx":-0.6008},{"date":"2024-10-31","qqq":-1.7324,"spy":-1.2023,"ndx":-1.6649},{"date":"2024-11-01","qqq":0.3975,"spy":-0.049,"ndx":0.3874},{"date":"2024-11-04","qqq":-0.1664,"spy":-0.2399,"ndx":-0.2396},{"date":"2024-11-05","qqq":0.9434,"spy":1.0443,"ndx":0.9207,"et":"Political","en":"US Election Day","ed":"Trump wins presidency; markets anticipate tax cuts, deregulation, tariffs"},{"date":"2024-11-06","qqq":1.0029,"spy":0.3123,"ndx":1.021},{"date":"2024-11-07","qqq":1.011,"spy":0.4266,"ndx":0.9818,"et":"Fed","en":"FOMC -25bps + Election Rally","ed":"Fed cut 25bps; Trump win euphoria \u2014 S&P 500 hit all-time high; Bitcoin surged"},{"date":"2024-11-08","qqq":0.2144,"spy":0.3388,"ndx":0.1594},{"date":"2024-11-11","qqq":-0.2969,"spy":-0.1751,"ndx":-0.3054},{"date":"2024-11-12","qqq":-0.1674,"spy":-0.2973,"ndx":-0.1644},{"date":"2024-11-13","qqq":-0.0293,"spy":-0.0301,"ndx":-0.0641},{"date":"2024-11-14","qqq":-0.629,"spy":-0.6646,"ndx":-0.7382},{"date":"2024-11-15","qqq":-1.2666,"spy":-0.6732,"ndx":-1.3823},{"date":"2024-11-18","qqq":0.3794,"spy":0.3292,"ndx":0.4351},{"date":"2024-11-19","qqq":1.2143,"spy":0.956,"ndx":1.218},{"date":"2024-11-20","qqq":0.002,"spy":0.0203,"ndx":0.0303,"et":"Earnings","en":"NVIDIA Q3 FY2025 beat","ed":"NVDA revenue $35.1B; Blackwell ramp confirmed; but 'only' beat by less than usual \u2014 stock dipped initially"},{"date":"2024-11-21","qqq":-0.2489,"spy":0.0455,"ndx":-0.166},{"date":"2024-11-22","qqq":0.2716,"spy":0.3116,"ndx":0.1868},{"date":"2024-11-25","qqq":-0.6491,"spy":-0.3319,"ndx":-0.5443},{"date":"2024-11-26","qqq":0.2421,"spy":0.309,"ndx":0.246},{"date":"2024-11-27","qqq":-0.5648,"spy":-0.2715,"ndx":-0.5176},{"date":"2024-11-29","qqq":0.7531,"spy":0.4819,"ndx":0.7672},{"date":"2024-12-02","qqq":0.8376,"spy":0.1095,"ndx":0.9195},{"date":"2024-12-03","qqq":0.5681,"spy":0.0862,"ndx":0.5819},{"date":"2024-12-04","qqq":0.565,"spy":0.3352,"ndx":0.6111},{"date":"2024-12-05","qqq":-0.2866,"spy":-0.1646,"ndx":-0.2946},{"date":"2024-12-06","qqq":0.7656,"spy":0.0609,"ndx":0.7627},{"date":"2024-12-09","qqq":-0.6032,"spy":-0.4953,"ndx":-0.6162},{"date":"2024-12-10","qqq":-0.5768,"spy":-0.4245,"ndx":-0.5785},{"date":"2024-12-11","qqq":0.9371,"spy":0.2773,"ndx":1.038,"et":"Macro","en":"CPI in-line","ed":"CPI matched expectations; December cut odds held; brief relief"},{"date":"2024-12-12","qqq":-0.2236,"spy":-0.3709,"ndx":-0.1736,"et":"IPO","en":"ServiceTitan (SITI) IPO","ed":"SMB software platform; priced at $71 (above range); +42% Day 1 \u2014 vindicated IPO class of 2024"},{"date":"2024-12-13","qqq":0.0132,"spy":-0.3611,"ndx":-0.0431},{"date":"2024-12-16","qqq":0.9548,"spy":0.1304,"ndx":0.9378},{"date":"2024-12-17","qqq":-0.1044,"spy":0.0165,"ndx":-0.0116},{"date":"2024-12-18","qqq":-3.4906,"spy":-2.9306,"ndx":-3.5042,"et":"Fed","en":"FOMC -25bps \u2014 hawkish shock","ed":"Fed cut 25bps but projected only 2 cuts in 2025 (down from 4); market crashed"},{"date":"2024-12-19","qqq":-1.3469,"spy":-0.8895,"ndx":-1.1624},{"date":"2024-12-20","qqq":1.6104,"spy":1.6123,"ndx":1.6691},{"date":"2024-12-23","qqq":0.639,"spy":0.6431,"ndx":0.6502},{"date":"2024-12-24","qqq":0.9775,"spy":0.8791,"ndx":1.0818},{"date":"2024-12-26","qqq":0.2423,"spy":0.3069,"ndx":0.158},{"date":"2024-12-27","qqq":-0.6559,"spy":-0.4234,"ndx":-0.74},{"date":"2024-12-30","qqq":0.0194,"spy":0.0561,"ndx":0.0377},{"date":"2024-12-31","qqq":-1.0969,"spy":-0.6492,"ndx":-1.1472},{"date":"2025-01-02","qqq":-0.7914,"spy":-0.8059,"ndx":-0.6839},{"date":"2025-01-03","qqq":1.0188,"spy":0.7523,"ndx":1.0872},{"date":"2025-01-06","qqq":0.0992,"spy":-0.1526,"ndx":0.0386},{"date":"2025-01-07","qqq":-1.9806,"spy":-1.4713,"ndx":-2.0669},{"date":"2025-01-08","qqq":0.0369,"spy":0.1342,"ndx":0.1144},{"date":"2025-01-10","qqq":-0.8387,"spy":-0.92,"ndx":-0.7839},{"date":"2025-01-13","qqq":0.8699,"spy":0.9761,"ndx":0.9278},{"date":"2025-01-14","qqq":-0.7194,"spy":-0.3713,"ndx":-0.6649},{"date":"2025-01-15","qqq":0.7154,"spy":0.415,"ndx":0.8071},{"date":"2025-01-16","qqq":-1.1368,"spy":-0.4258,"ndx":-1.096},{"date":"2025-01-17","qqq":-0.2123,"spy":0.1039,"ndx":-0.0966},{"date":"2025-01-21","qqq":0.061,"spy":0.3962,"ndx":0.0403,"et":"AI","en":"Stargate Project announced","ed":"Trump + OpenAI + SoftBank + Oracle: $500B AI infrastructure investment over 4 years"},{"date":"2025-01-22","qqq":0.3663,"spy":0.0858,"ndx":0.4448},{"date":"2025-01-23","qqq":0.6805,"spy":0.652,"ndx":0.753},{"date":"2025-01-24","qqq":-0.636,"spy":-0.3017,"ndx":-0.6455},{"date":"2025-01-27","qqq":0.6282,"spy":0.7666,"ndx":0.6053,"et":"AI","en":"DeepSeek R1 \u2014 AI efficiency shock","ed":"DeepSeek matched GPT-4 at 1/50th training cost; NVDA -17%; AI energy stocks -20%+; 'jevons paradox' debate"},{"date":"2025-01-28","qqq":1.2791,"spy":0.6493,"ndx":1.3073},{"date":"2025-01-29","qqq":-0.312,"spy":-0.3164,"ndx":-0.2866,"et":"Fed","en":"FOMC HOLD","ed":"Fed paused; uncertainty about tariff inflation impact; no guidance on future cuts"},{"date":"2025-01-30","qqq":-0.126,"spy":0.1788,"ndx":-0.0543},{"date":"2025-01-31","qqq":-0.8787,"spy":-0.935,"ndx":-0.8472},{"date":"2025-02-03","qqq":0.9037,"spy":0.8605,"ndx":1.0099},{"date":"2025-02-04","qqq":1.126,"spy":0.6607,"ndx":1.1602},{"date":"2025-02-05","qqq":0.9639,"spy":0.596,"ndx":0.9522},{"date":"2025-02-06","qqq":0.4248,"spy":0.0545,"ndx":0.4609},{"date":"2025-02-07","qqq":-1.3619,"spy":-1.0084,"ndx":-1.3086},{"date":"2025-02-10","qqq":0.385,"spy":0.1357,"ndx":0.4},{"date":"2025-02-11","qqq":0.386,"spy":0.4581,"ndx":0.2978},{"date":"2025-02-12","qqq":1.1488,"spy":0.6943,"ndx":1.1355},{"date":"2025-02-13","qqq":1.117,"spy":0.8685,"ndx":1.1225},{"date":"2025-02-14","qqq":0.3992,"spy":-0.0393,"ndx":0.3452},{"date":"2025-02-18","qqq":-0.0667,"spy":0.0999,"ndx":-0.0514},{"date":"2025-02-19","qqq":0.1764,"spy":0.4671,"ndx":0.2435,"et":"Macro","en":"FOMC minutes hawkish","ed":"Minutes showed Fed in no rush to cut; tech selloff continued"},{"date":"2025-02-20","qqq":-0.2784,"spy":-0.1897,"ndx":-0.2921},{"date":"2025-02-21","qqq":-2.2846,"spy":-1.675,"ndx":-2.2453},{"date":"2025-02-24","qqq":-1.5174,"spy":-0.799,"ndx":-1.4642},{"date":"2025-02-25","qqq":-1.1401,"spy":-0.4873,"ndx":-1.086},{"date":"2025-02-26","qqq":-0.1882,"spy":-0.2333,"ndx":-0.1776,"et":"Earnings","en":"NVIDIA Q4 FY2025 beat \u2014 DeepSeek hangover","ed":"NVDA beat again but DeepSeek efficiency fears lingered; guidance in-line not blowout"},{"date":"2025-02-27","qqq":-3.447,"spy":-1.977,"ndx":-3.4322,"et":"Macro","en":"Tariff threat + weak PCE + NVDA selloff","ed":"Trump announced 25% tariffs on Canada/Mexico; PCE data + market fear selloff"},{"date":"2025-02-28","qqq":1.6076,"spy":1.4721,"ndx":1.7826},{"date":"2025-03-03","qqq":-2.8288,"spy":-2.0816,"ndx":-2.687,"et":"Political","en":"Canada/Mexico tariffs activated","ed":"25% tariffs took effect on Canada/Mexico; markets sold off hard"},{"date":"2025-03-04","qqq":0.2772,"spy":-0.4916,"ndx":0.3483},{"date":"2025-03-05","qqq":1.1709,"spy":1.1046,"ndx":1.3025},{"date":"2025-03-06","qqq":-1.112,"spy":-0.4813,"ndx":-0.8853},{"date":"2025-03-07","qqq":0.9504,"spy":0.8793,"ndx":0.928},{"date":"2025-03-10","qqq":-2.2174,"spy":-1.235,"ndx":-1.9973},{"date":"2025-03-11","qqq":-0.1588,"spy":-0.6221,"ndx":-0.1472},{"date":"2025-03-12","qqq":-0.4675,"spy":-0.587,"ndx":-0.3426,"et":"Political","en":"Retaliation tariffs announced","ed":"Canada and EU announced retaliatory tariff packages; escalation fears"},{"date":"2025-03-13","qqq":-1.6609,"spy":-1.2659,"ndx":-1.5813},{"date":"2025-03-14","qqq":1.2518,"spy":1.2048,"ndx":1.2629},{"date":"2025-03-17","qqq":0.6589,"spy":0.7747,"ndx":0.7196},{"date":"2025-03-18","qqq":-1.0158,"spy":-0.6693,"ndx":-0.8839},{"date":"2025-03-19","qqq":0.8557,"spy":0.764,"ndx":0.819},{"date":"2025-03-20","qqq":0.4991,"spy":0.3834,"ndx":0.6101},{"date":"2025-03-21","qqq":1.4259,"spy":0.8404,"ndx":1.4771},{"date":"2025-03-24","qqq":0.5987,"spy":0.5746,"ndx":0.6948},{"date":"2025-03-25","qqq":0.4212,"spy":0.0278,"ndx":0.4522},{"date":"2025-03-26","qqq":-1.6088,"spy":-1.1474,"ndx":-1.5912},{"date":"2025-03-27","qqq":-0.1638,"spy":-0.0176,"ndx":-0.0807},{"date":"2025-03-28","qqq":-2.2655,"spy":-1.7453,"ndx":-2.2165,"et":"IPO","en":"CoreWeave (CRWV) IPO","ed":"AI cloud compute; priced at $40 (below $47-55 range) \u2014 IPO disappoints; AI infra demand questioned"},{"date":"2025-03-31","qqq":1.5154,"spy":1.7387,"ndx":1.4733},{"date":"2025-04-01","qqq":1.1556,"spy":0.6314,"ndx":1.2695},{"date":"2025-04-02","qqq":2.1518,"spy":1.7062,"ndx":2.0821,"et":"Political","en":"Liberation Day \u2014 Trump tariff shock","ed":"Trump announced sweeping tariffs: 10% universal, 34% on China, 20% EU, 24% Japan"},{"date":"2025-04-03","qqq":-1.2663,"spy":-1.5428,"ndx":-1.3459},{"date":"2025-04-04","qqq":-3.5308,"spy":-3.5118,"ndx":-3.465,"et":"Political","en":"China 34% retaliation tariff","ed":"China matched US tariffs 1:1; trade war escalation; recession fears spiked"},{"date":"2025-04-07","qqq":3.6779,"spy":3.1051,"ndx":3.9287,"et":"Political","en":"Tariff pause rumors + short squeeze","ed":"Reports of possible tariff negotiations; oversold bounce + short covering"},{"date":"2025-04-08","qqq":-5.0438,"spy":-4.8634,"ndx":-5.2348,"et":"Political","en":"China tariff escalation to 104%","ed":"Trump raised China tariffs to 104%; China matched; full trade war panic"},{"date":"2025-04-09","qqq":12.1351,"spy":11.1827,"ndx":11.8513,"et":"Political","en":"90-day tariff PAUSE \u2014 largest single-day gain since 2020","ed":"Trump announced 90-day pause on most tariffs (not China); QQQ +12.1% \u2014 largest day in years"},{"date":"2025-04-10","qqq":-1.6271,"spy":-1.4262,"ndx":-1.5169},{"date":"2025-04-11","qqq":2.1927,"spy":2.0898,"ndx":2.0796},{"date":"2025-04-14","qqq":-1.5028,"spy":-0.9062,"ndx":-1.5683},{"date":"2025-04-15","qqq":-0.1199,"spy":-0.3817,"ndx":-0.0093},{"date":"2025-04-16","qqq":-1.0801,"spy":-1.1323,"ndx":-1.1806},{"date":"2025-04-17","qqq":-0.6865,"spy":-0.2331,"ndx":-0.6087},{"date":"2025-04-21","qqq":-1.1683,"spy":-1.3969,"ndx":-1.1913},{"date":"2025-04-22","qqq":1.2898,"spy":1.3669,"ndx":1.3447},{"date":"2025-04-23","qqq":-0.7879,"spy":-0.927,"ndx":-0.9399},{"date":"2025-04-24","qqq":2.3813,"spy":1.8576,"ndx":2.4411,"et":"Earnings","en":"Alphabet/Tesla beat + trade deal hopes","ed":"GOOGL beat; TSLA surprise; US-China trade dialogue reported"},{"date":"2025-04-25","qqq":1.1971,"spy":0.7299,"ndx":1.16},{"date":"2025-04-28","qqq":-0.1311,"spy":-0.0979,"ndx":-0.028},{"date":"2025-04-29","qqq":1.14,"spy":0.9856,"ndx":1.1855},{"date":"2025-04-30","qqq":1.7854,"spy":1.2729,"ndx":2.1021},{"date":"2025-05-01","qqq":-0.3579,"spy":-0.3391,"ndx":-0.4033},{"date":"2025-05-02","qqq":0.4707,"spy":0.3595,"ndx":0.5804},{"date":"2025-05-05","qqq":0.2745,"spy":0.1671,"ndx":0.1963},{"date":"2025-05-06","qqq":0.3858,"spy":0.1559,"ndx":0.4146},{"date":"2025-05-07","qqq":0.2531,"spy":0.1785,"ndx":0.3205,"et":"AI","en":"Google I/O \u2014 AI Mode, Gemini advances","ed":"Google announced AI Mode for Search; Gemini Flash 2.5; NotebookLM expansion"},{"date":"2025-05-08","qqq":-0.0491,"spy":-0.0318,"ndx":-0.0193},{"date":"2025-05-09","qqq":-0.4569,"spy":-0.3778,"ndx":-0.54},{"date":"2025-05-12","qqq":0.1696,"spy":0.2614,"ndx":0.2371,"et":"Political","en":"US-China 90-day tariff truce","ed":"US and China agreed to pause: US tariffs cut to 30%, China to 10% for 90 days"},{"date":"2025-05-13","qqq":1.2629,"spy":0.5879,"ndx":1.3908},{"date":"2025-05-14","qqq":0.3696,"spy":-0.0374,"ndx":0.3046},{"date":"2025-05-15","qqq":0.5285,"spy":0.8368,"ndx":0.6087},{"date":"2025-05-16","qqq":0.1633,"spy":0.4989,"ndx":0.2447,"et":"Political","en":"Moody's US credit downgrade","ed":"Moody's cut US credit rating from Aaa to Aa1; 10yr yield spike to 4.5%+"},{"date":"2025-05-19","qqq":1.511,"spy":1.1478,"ndx":1.4614},{"date":"2025-05-20","qqq":0.154,"spy":-0.0405,"ndx":0.0925,"et":"IPO","en":"Klarna IPO","ed":"BNPL giant; priced at $68.5; massive BNPL revival story; profitable for first time since 2020"},{"date":"2025-05-21","qqq":-0.6256,"spy":-0.9483,"ndx":-0.6455},{"date":"2025-05-22","qqq":0.0662,"spy":0.0738,"ndx":0.0711,"et":"Political","en":"'Big Beautiful Bill' passes House","ed":"Trump tax cut bill passed House; adds $3-5T to deficit; bond yields surged (Moody's downgrade same week)"},{"date":"2025-05-23","qqq":0.6045,"spy":0.5434,"ndx":0.5253},{"date":"2025-05-27","qqq":0.9823,"spy":0.8668,"ndx":1.0072},{"date":"2025-05-28","qqq":-0.6262,"spy":-0.6474,"ndx":-0.6224,"et":"Earnings","en":"NVIDIA Q1 FY2026 strong beat","ed":"NVDA revenue $44B; Blackwell demand 'insane'; AI capex supercycle confirmed"},{"date":"2025-05-29","qqq":-1.216,"spy":-0.5075,"ndx":-1.1456},{"date":"2025-05-30","qqq":-0.0635,"spy":0.0781,"ndx":0.0475},{"date":"2025-06-02","qqq":1.1542,"spy":0.8422,"ndx":1.0398},{"date":"2025-06-03","qqq":0.7143,"spy":0.6331,"ndx":0.6159},{"date":"2025-06-04","qqq":0.1439,"spy":-0.1725,"ndx":0.1517},{"date":"2025-06-05","qqq":-1.0166,"spy":-0.7664,"ndx":-1.0784},{"date":"2025-06-06","qqq":-0.0151,"spy":0.0802,"ndx":-0.0721},{"date":"2025-06-09","qqq":0.1056,"spy":-0.0067,"ndx":0.0858},{"date":"2025-06-10","qqq":0.5723,"spy":0.4765,"ndx":0.5597},{"date":"2025-06-11","qqq":-0.5993,"spy":-0.4684,"ndx":-0.6063,"et":"IPO","en":"Hinge Health IPO","ed":"Digital physical therapy; priced at $32; digital health IPO recovery signal"},{"date":"2025-06-12","qqq":0.4839,"spy":0.6233,"ndx":0.3964},{"date":"2025-06-13","qqq":-0.1364,"spy":-0.2506,"ndx":-0.2071},{"date":"2025-06-16","qqq":0.7144,"spy":0.3797,"ndx":0.7092},{"date":"2025-06-17","qqq":-0.4946,"spy":-0.4465,"ndx":-0.6396},{"date":"2025-06-18","qqq":-0.2094,"spy":-0.1671,"ndx":-0.1187,"et":"Fed","en":"FOMC HOLD","ed":"Fed held rates; still data-dependent on tariff inflation impact"},{"date":"2025-06-20","qqq":-1.0202,"spy":-0.6852,"ndx":-0.9531},{"date":"2025-06-23","qqq":0.9187,"spy":0.8588,"ndx":1.0334},{"date":"2025-06-24","qqq":0.5383,"spy":0.4054,"ndx":0.6221},{"date":"2025-06-25","qqq":-0.166,"spy":-0.1299,"ndx":-0.1883},{"date":"2025-06-26","qqq":0.5282,"spy":0.4729,"ndx":0.5332},{"date":"2025-06-27","qqq":0.1517,"spy":0.3312,"ndx":0.2194},{"date":"2025-06-30","qqq":0.0689,"spy":0.0761,"ndx":0.2036},{"date":"2025-07-01","qqq":-0.4984,"spy":0.2093,"ndx":-0.5149},{"date":"2025-07-02","qqq":0.8496,"spy":0.5201,"ndx":0.8466},{"date":"2025-07-03","qqq":0.5495,"spy":0.4643,"ndx":0.5069},{"date":"2025-07-07","qqq":-0.2692,"spy":-0.4299,"ndx":-0.3024},{"date":"2025-07-08","qqq":-0.1879,"spy":-0.1625,"ndx":-0.1452},{"date":"2025-07-09","qqq":0.3192,"spy":0.2071,"ndx":0.2831},{"date":"2025-07-10","qqq":-0.2586,"spy":0.2595,"ndx":-0.2672},{"date":"2025-07-11","qqq":0.1627,"spy":0.1413,"ndx":0.0993},{"date":"2025-07-14","qqq":0.4007,"spy":0.2648,"ndx":0.3312},{"date":"2025-07-15","qqq":-0.6301,"spy":-0.8573,"ndx":-0.661},{"date":"2025-07-16","qqq":0.0018,"spy":0.077,"ndx":0.0553},{"date":"2025-07-17","qqq":0.6774,"spy":0.583,"ndx":0.6543},{"date":"2025-07-18","qqq":-0.3303,"spy":-0.2733,"ndx":-0.3009},{"date":"2025-07-21","qqq":0.37,"spy":0.0,"ndx":0.2382},{"date":"2025-07-22","qqq":-0.5405,"spy":-0.0381,"ndx":-0.5109},{"date":"2025-07-23","qqq":0.2614,"spy":0.4212,"ndx":0.2691},{"date":"2025-07-24","qqq":-0.0212,"spy":-0.0284,"ndx":-0.0384},{"date":"2025-07-25","qqq":0.2549,"spy":0.3165,"ndx":0.2913},{"date":"2025-07-28","qqq":0.0705,"spy":-0.0847,"ndx":0.0563},{"date":"2025-07-29","qqq":-0.6132,"spy":-0.4841,"ndx":-0.7221},{"date":"2025-07-30","qqq":-0.0282,"spy":-0.2296,"ndx":0.0346},{"date":"2025-07-31","qqq":-1.6587,"spy":-1.1541,"ndx":-1.5738},{"date":"2025-08-01","qqq":-0.8858,"spy":-0.7313,"ndx":-0.7748},{"date":"2025-08-04","qqq":0.9033,"spy":0.8791,"ndx":0.8781},{"date":"2025-08-05","qqq":-0.9056,"spy":-0.6046,"ndx":-0.9328},{"date":"2025-08-06","qqq":1.1067,"spy":0.593,"ndx":1.058},{"date":"2025-08-07","qqq":-0.4251,"spy":-0.6271,"ndx":-0.3998},{"date":"2025-08-08","qqq":0.7187,"spy":0.4921,"ndx":0.6528},{"date":"2025-08-11","qqq":-0.3202,"spy":-0.2416,"ndx":-0.4333},{"date":"2025-08-12","qqq":0.8502,"spy":0.6893,"ndx":0.7931},{"date":"2025-08-13","qqq":-0.4153,"spy":-0.0031,"ndx":-0.3594},{"date":"2025-08-14","qqq":0.2784,"spy":0.336,"ndx":0.2416},{"date":"2025-08-15","qqq":-0.4243,"spy":-0.3947,"ndx":-0.4071},{"date":"2025-08-18","qqq":0.1162,"spy":0.0684,"ndx":0.0913},{"date":"2025-08-19","qqq":-1.2335,"spy":-0.5147,"ndx":-1.2844},{"date":"2025-08-20","qqq":-0.4276,"spy":-0.2018,"ndx":-0.402},{"date":"2025-08-21","qqq":-0.1896,"spy":-0.1147,"ndx":-0.1733},{"date":"2025-08-22","qqq":1.2928,"spy":1.1838,"ndx":1.3506},{"date":"2025-08-25","qqq":-0.014,"spy":-0.2438,"ndx":-0.1222},{"date":"2025-08-26","qqq":0.4879,"spy":0.4609,"ndx":0.4459},{"date":"2025-08-27","qqq":0.3324,"spy":0.3196,"ndx":0.2816},{"date":"2025-08-28","qqq":0.5173,"spy":0.2596,"ndx":0.4326},{"date":"2025-08-29","qqq":-0.7413,"spy":-0.3738,"ndx":-0.8138},{"date":"2025-09-02","qqq":0.7678,"spy":0.4345,"ndx":0.915},{"date":"2025-09-03","qqq":0.1476,"spy":0.1665,"ndx":0.1136},{"date":"2025-09-04","qqq":0.7867,"spy":0.7293,"ndx":0.814},{"date":"2025-09-05","qqq":-0.7631,"spy":-0.6508,"ndx":-0.795},{"date":"2025-09-08","qqq":0.0864,"spy":0.0324,"ndx":0.0113},{"date":"2025-09-09","qqq":0.1449,"spy":0.2096,"ndx":0.0649},{"date":"2025-09-10","qqq":-0.5208,"spy":-0.2157,"ndx":-0.3429},{"date":"2025-09-11","qqq":0.144,"spy":0.5274,"ndx":0.1502},{"date":"2025-09-12","qqq":0.2769,"spy":-0.0289,"ndx":0.2556},{"date":"2025-09-15","qqq":0.5506,"spy":0.1925,"ndx":0.4764},{"date":"2025-09-16","qqq":-0.2413,"spy":-0.2222,"ndx":-0.2814},{"date":"2025-09-17","qqq":-0.1861,"spy":-0.1258,"ndx":-0.2583},{"date":"2025-09-18","qqq":0.0689,"spy":0.0559,"ndx":0.1379},{"date":"2025-09-19","qqq":0.3382,"spy":0.2068,"ndx":0.3988},{"date":"2025-09-22","qqq":0.7461,"spy":0.7007,"ndx":0.7031},{"date":"2025-09-23","qqq":-0.6923,"spy":-0.5265,"ndx":-0.6972},{"date":"2025-09-24","qqq":-0.5804,"spy":-0.5132,"ndx":-0.5899},{"date":"2025-09-25","qqq":0.2246,"spy":0.0167,"ndx":0.3108},{"date":"2025-09-26","qqq":0.2726,"spy":0.3503,"ndx":0.3806},{"date":"2025-09-29","qqq":-0.0634,"spy":-0.1024,"ndx":-0.0717},{"date":"2025-09-30","qqq":0.3242,"spy":0.4902,"ndx":0.3358},{"date":"2025-10-01","qqq":1.0181,"spy":0.7962,"ndx":1.0661},{"date":"2025-10-02","qqq":-0.2191,"spy":-0.1835,"ndx":-0.1634},{"date":"2025-10-03","qqq":-0.549,"spy":-0.1164,"ndx":-0.5852},{"date":"2025-10-06","qqq":-0.1216,"spy":-0.0015,"ndx":-0.0308},{"date":"2025-10-07","qqq":-0.7405,"spy":-0.5085,"ndx":-0.7652},{"date":"2025-10-08","qqq":0.996,"spy":0.4267,"ndx":1.0017},{"date":"2025-10-09","qqq":-0.1276,"spy":-0.3519,"ndx":-0.1059},{"date":"2025-10-10","qqq":-3.5819,"spy":-2.8432,"ndx":-3.5637,"et":"Political","en":"Tariff escalation \u2014 90-day pause expired","ed":"90-day China tariff truce expired; new tariff levels took effect; markets sold off"},{"date":"2025-10-13","qqq":0.3885,"spy":0.3618,"ndx":0.5056},{"date":"2025-10-14","qqq":0.4519,"spy":0.77,"ndx":0.558},{"date":"2025-10-15","qqq":-0.2964,"spy":-0.2474,"ndx":-0.2498},{"date":"2025-10-16","qqq":-0.8461,"spy":-0.9268,"ndx":-0.9042},{"date":"2025-10-17","qqq":1.0001,"spy":0.7415,"ndx":0.8837},{"date":"2025-10-20","qqq":0.7247,"spy":0.5964,"ndx":0.5999},{"date":"2025-10-21","qqq":-0.0425,"spy":-0.0223,"ndx":-0.0504},{"date":"2025-10-22","qqq":-0.8726,"spy":-0.625,"ndx":-0.8553},{"date":"2025-10-23","qqq":0.9373,"spy":0.5448,"ndx":0.916},{"date":"2025-10-24","qqq":0.1802,"spy":0.1168,"ndx":0.1992},{"date":"2025-10-27","qqq":0.5716,"spy":0.3676,"ndx":0.4653},{"date":"2025-10-28","qqq":0.4061,"spy":0.0015,"ndx":0.3066},{"date":"2025-10-29","qqq":0.0283,"spy":-0.1931,"ndx":-0.1066},{"date":"2025-10-30","qqq":-0.9681,"spy":-0.5951,"ndx":-0.8437},{"date":"2025-10-31","qqq":-0.8042,"spy":-0.435,"ndx":-0.7593},{"date":"2025-11-03","qqq":-0.4771,"spy":-0.3398,"ndx":-0.5406},{"date":"2025-11-04","qqq":-0.6466,"spy":-0.1287,"ndx":-0.5654},{"date":"2025-11-05","qqq":0.7745,"spy":0.3852,"ndx":0.7345},{"date":"2025-11-06","qqq":-1.6276,"spy":-0.9106,"ndx":-1.7138},{"date":"2025-11-07","qqq":0.2351,"spy":0.4581,"ndx":0.3286},{"date":"2025-11-10","qqq":0.6964,"spy":0.6202,"ndx":0.7615},{"date":"2025-11-11","qqq":0.1611,"spy":0.4486,"ndx":0.1277},{"date":"2025-11-12","qqq":-0.6018,"spy":-0.2059,"ndx":-0.5645},{"date":"2025-11-13","qqq":-1.4801,"spy":-1.2432,"ndx":-1.55},{"date":"2025-11-14","qqq":1.5528,"spy":0.9844,"ndx":1.4181},{"date":"2025-11-17","qqq":-0.4354,"spy":-0.6018,"ndx":-0.3623},{"date":"2025-11-18","qqq":-0.552,"spy":-0.3051,"ndx":-0.6031},{"date":"2025-11-19","qqq":0.469,"spy":0.28,"ndx":0.5027},{"date":"2025-11-20","qqq":-4.2428,"spy":-3.0286,"ndx":-4.2859,"et":"Macro","en":"Major market shock","ed":"Significant macro-driven selloff \u2014 bond market dysfunction / fiscal fears"},{"date":"2025-11-21","qqq":0.4426,"spy":0.6076,"ndx":0.4222},{"date":"2025-11-24","qqq":1.6597,"spy":0.9114,"ndx":1.68},{"date":"2025-11-25","qqq":0.8915,"spy":0.9557,"ndx":0.9209},{"date":"2025-11-26","qqq":0.2873,"spy":0.3025,"ndx":0.2727},{"date":"2025-11-28","qqq":0.5097,"spy":0.3716,"ndx":0.4923},{"date":"2025-12-01","qqq":0.5769,"spy":0.2151,"ndx":0.4363},{"date":"2025-12-02","qqq":0.41,"spy":-0.0572,"ndx":0.4165},{"date":"2025-12-03","qqq":0.6294,"spy":0.4878,"ndx":0.64},{"date":"2025-12-04","qqq":-0.3184,"spy":-0.1328,"ndx":-0.2979},{"date":"2025-12-05","qqq":0.1762,"spy":0.0321,"ndx":0.1336},{"date":"2025-12-08","qqq":-0.4671,"spy":-0.4311,"ndx":-0.5081},{"date":"2025-12-09","qqq":0.3274,"spy":-0.0161,"ndx":0.2931},{"date":"2025-12-10","qqq":0.6027,"spy":0.734,"ndx":0.5651},{"date":"2025-12-11","qqq":0.2821,"spy":0.5882,"ndx":0.3449},{"date":"2025-12-12","qqq":-1.36,"spy":-0.9315,"ndx":-1.3114},{"date":"2025-12-15","qqq":-1.2662,"spy":-0.7306,"ndx":-1.1265},{"date":"2025-12-16","qqq":0.5738,"spy":-0.053,"ndx":0.566},{"date":"2025-12-17","qqq":-2.0634,"spy":-1.2487,"ndx":-2.0671},{"date":"2025-12-18","qqq":-0.1132,"spy":-0.1668,"ndx":-0.0484},{"date":"2025-12-19","qqq":0.8334,"spy":0.5912,"ndx":0.7909},{"date":"2025-12-22","qqq":-0.3444,"spy":0.1301,"ndx":-0.2585},{"date":"2025-12-23","qqq":0.6325,"spy":0.5907,"ndx":0.5755},{"date":"2025-12-24","qqq":0.3119,"spy":0.3532,"ndx":0.2885},{"date":"2025-12-26","qqq":-0.1233,"spy":-0.0478,"ndx":-0.1879},{"date":"2025-12-29","qqq":0.1242,"spy":0.0451,"ndx":0.2486},{"date":"2025-12-30","qqq":-0.0662,"spy":-0.064,"ndx":-0.1855},{"date":"2025-12-31","qqq":-0.8618,"spy":-0.7597,"ndx":-0.8438},{"date":"2026-01-02","qqq":-1.1192,"spy":-0.3704,"ndx":-1.2463},{"date":"2026-01-05","qqq":-0.2148,"spy":0.1719,"ndx":-0.2767},{"date":"2026-01-06","qqq":0.6766,"spy":0.564,"ndx":0.6977},{"date":"2026-01-07","qqq":0.1573,"spy":-0.3771,"ndx":0.1409},{"date":"2026-01-08","qqq":-0.4109,"spy":0.1002,"ndx":-0.4226},{"date":"2026-01-09","qqq":0.8433,"spy":0.4981,"ndx":0.9696},{"date":"2026-01-12","qqq":0.781,"spy":0.6486,"ndx":0.6669},{"date":"2026-01-13","qqq":-0.1642,"spy":-0.2473,"ndx":-0.1448},{"date":"2026-01-14","qqq":-0.4323,"spy":-0.0926,"ndx":-0.4287},{"date":"2026-01-15","qqq":-0.7692,"spy":-0.3355,"ndx":-0.8547},{"date":"2026-01-16","qqq":-0.6779,"spy":-0.2883,"ndx":-0.7053},{"date":"2026-01-20","qqq":-0.4046,"spy":-0.5737,"ndx":-0.6657},{"date":"2026-01-21","qqq":1.1174,"spy":0.846,"ndx":1.11},{"date":"2026-01-22","qqq":-0.2555,"spy":-0.1261,"ndx":-0.1175},{"date":"2026-01-23","qqq":0.4825,"spy":0.1569,"ndx":0.4061},{"date":"2026-01-26","qqq":0.361,"spy":0.3244,"ndx":0.3207},{"date":"2026-01-27","qqq":0.353,"spy":0.1887,"ndx":0.3392},{"date":"2026-01-28","qqq":-0.3525,"spy":-0.2338,"ndx":-0.3788},{"date":"2026-01-29","qqq":-0.509,"spy":-0.3375,"ndx":-0.56},{"date":"2026-01-30","qqq":-0.6137,"spy":0.026,"ndx":-0.7296},{"date":"2026-02-02","qqq":1.2025,"spy":0.8454,"ndx":0.9688},{"date":"2026-02-03","qqq":-1.8749,"spy":-0.9595,"ndx":-1.8303},{"date":"2026-02-04","qqq":-1.5073,"spy":-0.6026,"ndx":-1.3833},{"date":"2026-02-05","qqq":-0.5298,"spy":-0.4876,"ndx":-0.2688},{"date":"2026-02-06","qqq":1.5762,"spy":1.3442,"ndx":1.7056},{"date":"2026-02-09","qqq":1.116,"spy":0.6571,"ndx":1.2602},{"date":"2026-02-10","qqq":-0.6241,"spy":-0.4072,"ndx":-0.7371},{"date":"2026-02-11","qqq":-0.5305,"spy":-0.6361,"ndx":-0.5315},{"date":"2026-02-12","qqq":-2.2889,"spy":-1.8682,"ndx":-2.2711},{"date":"2026-02-13","qqq":0.2482,"spy":0.0088,"ndx":0.2829},{"date":"2026-02-17","qqq":0.488,"spy":0.3984,"ndx":0.5457},{"date":"2026-02-18","qqq":0.6112,"spy":0.3319,"ndx":0.6223},{"date":"2026-02-19","qqq":0.1095,"spy":0.0936,"ndx":0.1037},{"date":"2026-02-20","qqq":1.448,"spy":1.042,"ndx":1.5233},{"date":"2026-02-23","qqq":-0.8572,"spy":-0.7909,"ndx":-0.9087},{"date":"2026-02-24","qqq":0.908,"spy":0.7992,"ndx":0.8609},{"date":"2026-02-25","qqq":0.9181,"spy":0.4303,"ndx":0.7611},{"date":"2026-02-26","qqq":-1.0315,"spy":-0.5741,"ndx":-0.9648},{"date":"2026-02-27","qqq":0.7148,"spy":0.4245,"ndx":0.6129},{"date":"2026-03-02","qqq":1.5413,"spy":1.1316,"ndx":1.5984},{"date":"2026-03-03","qqq":0.8804,"spy":0.7807,"ndx":0.9091},{"date":"2026-03-04","qqq":1.0908,"spy":0.5135,"ndx":0.9768},{"date":"2026-03-05","qqq":0.2486,"spy":-0.1129,"ndx":0.1108},{"date":"2026-03-06","qqq":-0.0933,"spy":-0.1529,"ndx":-0.084},{"date":"2026-03-09","qqq":2.2769,"spy":1.7827,"ndx":2.2005,"et":"Macro","en":"Market recovery / buyback season","ed":"Strong corporate buyback activity + economic data recovery"},{"date":"2026-03-10","qqq":-0.0016,"spy":-0.0797,"ndx":-0.1845},{"date":"2026-03-11","qqq":-0.2069,"spy":-0.1845,"ndx":-0.3522},{"date":"2026-03-12","qqq":-0.9125,"spy":-0.7599,"ndx":-0.9597},{"date":"2026-03-13","qqq":-1.0021,"spy":-1.0429,"ndx":-1.1332},{"date":"2026-03-16","qqq":0.0567,"spy":0.0973,"ndx":0.0372},{"date":"2026-03-17","qqq":0.0282,"spy":-0.238,"ndx":0.0814},{"date":"2026-03-18","qqq":-1.0956,"spy":-1.0369,"ndx":-1.2213},{"date":"2026-03-19","qqq":0.5954,"spy":0.4308,"ndx":0.9781},{"date":"2026-03-20","qqq":-1.5227,"spy":-1.2094,"ndx":-1.4816},{"date":"2026-03-23","qqq":-0.4267,"spy":-0.4088,"ndx":-0.3386},{"date":"2026-03-24","qqq":-0.1419,"spy":0.2856,"ndx":-0.1655},{"date":"2026-03-25","qqq":-0.2241,"spy":-0.2809,"ndx":-0.3029},{"date":"2026-03-26","qqq":-1.5122,"spy":-1.0689,"ndx":-1.3641},{"date":"2026-03-27","qqq":-1.4418,"spy":-1.3089,"ndx":-1.4106},{"date":"2026-03-30","qqq":-1.6039,"spy":-1.2717,"ndx":-1.5204},{"date":"2026-03-31","qqq":2.2843,"spy":1.7842,"ndx":2.2931,"et":"Macro","en":"Quarter-end rebalancing rally","ed":"Q1 end institutional rebalancing + window dressing"},{"date":"2026-04-01","qqq":0.4867,"spy":0.2049,"ndx":0.5724},{"date":"2026-04-02","qqq":1.9182,"spy":1.4557,"ndx":1.7941},{"date":"2026-04-06","qqq":0.3872,"spy":0.4681,"ndx":0.2036},{"date":"2026-04-07","qqq":0.5037,"spy":0.3914,"ndx":0.3849},{"date":"2026-04-08","qqq":-0.4304,"spy":-0.0562,"ndx":-0.5677},{"date":"2026-04-09","qqq":0.7031,"spy":0.7513,"ndx":0.6574},{"date":"2026-04-10","qqq":-0.1259,"spy":-0.273,"ndx":-0.1936},{"date":"2026-04-13","qqq":1.2978,"spy":1.2828,"ndx":1.2551},{"date":"2026-04-14","qqq":1.3511,"spy":0.9845,"ndx":1.2834},{"date":"2026-04-15","qqq":1.3226,"spy":0.6731,"ndx":1.3357},{"date":"2026-04-16","qqq":0.1971,"spy":0.0856,"ndx":0.2899},{"date":"2026-04-17","qqq":0.505,"spy":0.5665,"ndx":0.4567},{"date":"2026-04-20","qqq":-0.1929,"spy":-0.0085,"ndx":-0.27},{"date":"2026-04-21","qqq":-0.6292,"spy":-0.8729,"ndx":-0.6729},{"date":"2026-04-22","qqq":0.7629,"spy":0.2905,"ndx":0.8286},{"date":"2026-04-23","qqq":-0.3259,"spy":-0.148,"ndx":-0.2309},{"date":"2026-04-24","qqq":0.8155,"spy":0.4488,"ndx":0.817},{"date":"2026-04-27","qqq":0.1251,"spy":0.2804,"ndx":0.1004},{"date":"2026-04-28","qqq":0.0213,"spy":-0.0183,"ndx":0.1491},{"date":"2026-04-29","qqq":0.4464,"spy":0.0816,"ndx":0.4345},{"date":"2026-04-30","qqq":0.3592,"spy":0.5639,"ndx":0.4506},{"date":"2026-05-01","qqq":0.7457,"spy":-0.0832,"ndx":0.7335},{"date":"2026-05-04","qqq":-0.2638,"spy":-0.2861,"ndx":-0.2867},{"date":"2026-05-05","qqq":0.5384,"spy":0.2771,"ndx":0.4302},{"date":"2026-05-06","qqq":1.1617,"spy":0.7787,"ndx":1.2933},{"date":"2026-05-07","qqq":-0.2354,"spy":-0.4721,"ndx":-0.1698},{"date":"2026-05-08","qqq":1.6159,"spy":0.366,"ndx":1.6229},{"date":"2026-05-11","qqq":0.4125,"spy":0.387,"ndx":0.462},{"date":"2026-05-12","qqq":-0.1384,"spy":0.1751,"ndx":-0.0088},{"date":"2026-05-13","qqq":0.6691,"spy":0.52,"ndx":0.7098},{"date":"2026-05-14","qqq":0.7235,"spy":0.6078,"ndx":0.707},{"date":"2026-05-15","qqq":-0.1704,"spy":-0.3532,"ndx":-0.2266},{"date":"2026-05-18","qqq":-0.7955,"spy":-0.1595,"ndx":-0.8611},{"date":"2026-05-19","qqq":0.2458,"spy":-0.1429,"ndx":0.0827},{"date":"2026-05-20","qqq":1.1144,"spy":0.753,"ndx":1.0037},{"date":"2026-05-21","qqq":0.7786,"spy":0.5524,"ndx":0.7106},{"date":"2026-05-22","qqq":-0.0738,"spy":-0.0804,"ndx":0.0182},{"date":"2026-05-26","qqq":0.5951,"spy":0.0773,"ndx":0.4915},{"date":"2026-05-27","qqq":-0.4789,"spy":-0.0559,"ndx":-0.3581},{"date":"2026-05-28","qqq":0.8044,"spy":0.5798,"ndx":0.6435},{"date":"2026-05-29","qqq":0.0637,"spy":0.0767,"ndx":-0.0022},{"date":"2026-06-01","qqq":0.7734,"spy":0.421,"ndx":0.7216},{"date":"2026-06-02","qqq":0.5065,"spy":0.3355,"ndx":0.6202},{"date":"2026-06-03","qqq":-0.4148,"spy":-0.5157,"ndx":-0.517}];

const TYPE_STATS = [{"type":"AI","avg":0.4574,"vol":0.4002,"count":9,"up":8,"down":1},{"type":"Banking Crisis","avg":0.9586,"vol":1.8282,"count":3,"up":2,"down":1},{"type":"Earnings","avg":0.3468,"vol":0.9713,"count":10,"up":6,"down":4},{"type":"Fed","avg":0.0729,"vol":1.3198,"count":14,"up":7,"down":7},{"type":"Geopolitical","avg":-1.7929,"vol":0.0,"count":1,"up":0,"down":1},{"type":"IPO","avg":-0.201,"vol":0.9147,"count":15,"up":8,"down":7},{"type":"Macro","avg":-0.4751,"vol":2.1373,"count":17,"up":9,"down":8},{"type":"Political","avg":0.3212,"vol":4.3213,"count":12,"up":7,"down":5}];

const SUMMARY = {"total_days":857,"event_days":81,"avg_all":0.0599,"avg_event":0.0302,"avg_non_event":0.063,"vol_event":2.1497,"vol_non_event":0.8444,"best":{"date":"2025-04-09","qqq":12.1351,"spy":11.1827,"ndx":11.8513,"et":"Political","en":"90-day tariff PAUSE \u2014 largest single-day gain since 2020","ed":"Trump announced 90-day pause on most tariffs (not China); QQQ +12.1% \u2014 largest day in years"},"worst":{"date":"2025-04-08","qqq":-5.0438,"spy":-4.8634,"ndx":-5.2348,"et":"Political","en":"China tariff escalation to 104%","ed":"Trump raised China tariffs to 104%; China matched; full trade war panic"},"big_moves":39};

const TYPE_META: Record<string, { color: string; icon: string }> = {
  "Fed":            { color: "#7c83fd", icon: "FED" },
  "Macro":          { color: "#ff9f43", icon: "MCR" },
  "Political":      { color: "#ff6b35", icon: "POL" },
  "Earnings":       { color: "#00d4ff", icon: "EPS" },
  "AI":             { color: "#a29bfe", icon: "AI·" },
  "IPO":            { color: "#55efc4", icon: "IPO" },
  "Banking Crisis": { color: "#fd79a8", icon: "BNK" },
  "Geopolitical":   { color: "#e17055", icon: "GEO" },
};

function pctColor(p: number) {
  if (p >= 3)  return "#00ff9d";
  if (p >= 1)  return "#7affc4";
  if (p >= 0)  return "#a8ffd9";
  if (p >= -1) return "#ffb3b3";
  if (p >= -3) return "#ff6b6b";
  return "#ff2222";
}

function Bar({ pct, maxAbs = 5 }: { pct: number; maxAbs?: number }) {
  const w = Math.min(Math.abs(pct) / maxAbs * 100, 100);
  const pos = pct >= 0;
  return (
    <div style={{ display:"flex", alignItems:"center", width:120, gap:3 }}>
      {!pos && <div style={{ flex:1, height:6 }} />}
      <div style={{
        width: w + "%", maxWidth:120, minWidth:2, height:6, borderRadius:1,
        background: pos
          ? "linear-gradient(90deg,#00ff9d44,#00ff9d)"
          : "linear-gradient(90deg,#ff222244,#ff2222)"
      }} />
      {pos && <div style={{ flex:1, height:6 }} />}
    </div>
  );
}

function StatCard({ label, val, color, sub }: { label: string; val: string | number; color: string; sub?: string }) {
  return (
    <div style={{ background:"#0d1420", border:"1px solid #1a2540", borderRadius:4, padding:"10px 16px", minWidth:120 }}>
      <div style={{ fontSize:9, color:"#3a5070", letterSpacing:2, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:16, fontWeight:700, color }}>{val}</div>
      {sub && <div style={{ fontSize:10, color:"#3a5070", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

type Row = {
  date: string;
  qqq: number;
  spy: number | null;
  ndx: number | null;
  et?: string;
  en?: string;
  ed?: string;
};

type TypeStat = {
  type: string;
  avg: number;
  vol: number;
  count: number;
  up: number;
  down: number;
};

const TABS = ["TIMELINE", "EVENT ANALYSIS", "TOP MOVES", "CORRELATION"];
const YEAR_FILTERS = ["ALL", "2025-2026", "2024", "2023"];
const TICKER_FILTERS = ["QQQ", "SPY", "NDX"] as const;
type TickerKey = typeof TICKER_FILTERS[number];

export default function MarketEventDashboard() {
  const [tab, setTab] = useState("TIMELINE");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [ticker, setTicker] = useState<TickerKey>("QQQ");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [showEventsOnly, setShowEventsOnly] = useState(false);
  const [showExtremeOnly, setShowExtremeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 60;

  const rows = ROWS as Row[];
  const typeStats = TYPE_STATS as TypeStat[];

  const filtered = useMemo(() => {
    let r = [...rows];
    if (yearFilter !== "ALL") {
      if (yearFilter === "2025-2026") r = r.filter(x => x.date >= "2025");
      else r = r.filter(x => x.date.startsWith(yearFilter));
    }
    if (showEventsOnly) r = r.filter(x => x.et);
    if (showExtremeOnly) r = r.filter(x => Math.abs((x as Record<string, unknown>)[ticker.toLowerCase()] as number ?? x.qqq) >= 2);
    if (eventTypeFilter !== "ALL") r = r.filter(x => x.et === eventTypeFilter);
    if (search) r = r.filter(x => x.date.includes(search) || (x.en && x.en.toLowerCase().includes(search.toLowerCase())));
    return [...r].reverse();
  }, [rows, yearFilter, ticker, showEventsOnly, showExtremeOnly, eventTypeFilter, search]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const tCol = ticker.toLowerCase() as "qqq" | "spy" | "ndx";

  const s = SUMMARY as {
    total_days: number; event_days: number; avg_all: number;
    avg_event: number; avg_non_event: number; vol_event: number; vol_non_event: number;
    best: Row; worst: Row; big_moves: number;
  };

  return (
    <div style={{ minHeight:"100vh", background:"#080b12", color:"#e8edf5", fontFamily:"'JetBrains Mono','Fira Code','Courier New',monospace" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(180deg,#0d1420 0%,#080b12 100%)", borderBottom:"1px solid #1a2540", padding:"24px 32px 20px" }}>
        <div style={{ fontSize:11, letterSpacing:4, color:"#4a6fa5", textTransform:"uppercase" }}>MARKET DAILY RETURNS · EVENT CORRELATION ENGINE</div>
        <div style={{ marginTop:6, fontSize:22, fontWeight:700, letterSpacing:-0.5, color:"#c8d8f0" }}>
          QQQ · SPY · NDX
          <span style={{ fontSize:12, marginLeft:12, color:"#3a5070", fontWeight:400 }}>
            2023–2026 · 857 trading days · 89 annotated events
          </span>
        </div>
        <div style={{ marginTop:8, fontSize:11, color:"#3a5070", lineHeight:1.7 }}>
          Event-day volatility is{" "}
          <span style={{ color:"#ff9f43", fontWeight:700 }}>2.55× higher</span> than normal days ·
          Best: <span style={{ color:"#00ff9d", fontWeight:700 }}>+12.1% Apr 9 2025 (tariff pause)</span> ·
          Worst: <span style={{ color:"#ff2222", fontWeight:700 }}>−5.0% Apr 8 2025 (China 104% tariff)</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid #1a2540", background:"#0a0e18" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:"12px 24px", background: tab===t ? "#0d1a2e" : "transparent",
            border:"none", borderBottom: tab===t ? "2px solid #00d4ff" : "2px solid transparent",
            color: tab===t ? "#00d4ff" : "#3a5070", cursor:"pointer", fontSize:11,
            fontFamily:"inherit", fontWeight:700, letterSpacing:2, transition:"all 0.15s"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding:"20px 32px", maxWidth:1500 }}>

        {/* Summary Stats */}
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <StatCard label="TOTAL DAYS"     val={s.total_days}  color="#c8d8f0" />
          <StatCard label="EVENT DAYS"     val={s.event_days}  color="#7c83fd" sub={`${((s.event_days/s.total_days)*100).toFixed(1)}% of sessions`} />
          <StatCard label="AVG RETURN/DAY" val={(s.avg_all>=0?"+":"")+s.avg_all.toFixed(3)+"%"} color={s.avg_all>=0?"#00ff9d":"#ff6b6b"} />
          <StatCard label="EVENT DAY VOL"  val={s.vol_event.toFixed(2)+"%"}    color="#ff9f43" sub="±σ intraday" />
          <StatCard label="NORMAL DAY VOL" val={s.vol_non_event.toFixed(2)+"%"} color="#4a8ab5" sub={`${(s.vol_event/s.vol_non_event).toFixed(2)}× lower`} />
          <StatCard label="BEST DAY"       val={"+"+s.best.qqq.toFixed(2)+"%"} color="#00ff9d" sub={s.best.date} />
          <StatCard label="WORST DAY"      val={s.worst.qqq.toFixed(2)+"%"}    color="#ff2222" sub={s.worst.date} />
          <StatCard label="±2%+ MOVES"     val={s.big_moves}  color="#ff6b35" sub={`${((s.big_moves/s.total_days)*100).toFixed(1)}% of days`} />
        </div>

        {/* ── TIMELINE ── */}
        {tab === "TIMELINE" && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
              {YEAR_FILTERS.map(y => (
                <button key={y} onClick={() => { setYearFilter(y); setPage(0); }} style={{
                  padding:"5px 12px", background: yearFilter===y ? "#00d4ff22" : "#0d1420",
                  border:`1px solid ${yearFilter===y?"#00d4ff":"#1a2540"}`,
                  borderRadius:3, color: yearFilter===y?"#00d4ff":"#4a6fa5",
                  cursor:"pointer", fontSize:11, fontFamily:"inherit", letterSpacing:1
                }}>{y}</button>
              ))}
              <div style={{ width:1, height:20, background:"#1a2540", margin:"0 4px" }} />
              {TICKER_FILTERS.map(tk => (
                <button key={tk} onClick={() => setTicker(tk)} style={{
                  padding:"5px 12px", background: ticker===tk ? "#ffffff11" : "#0d1420",
                  border:`1px solid ${ticker===tk?"#c8d8f0":"#1a2540"}`,
                  borderRadius:3, color: ticker===tk?"#c8d8f0":"#4a6fa5",
                  cursor:"pointer", fontSize:11, fontFamily:"inherit", letterSpacing:1, fontWeight: ticker===tk ? 700 : 400
                }}>{tk}</button>
              ))}
              <div style={{ width:1, height:20, background:"#1a2540", margin:"0 4px" }} />
              {Object.entries(TYPE_META).map(([et, m]) => (
                <button key={et} onClick={() => { setEventTypeFilter(eventTypeFilter===et?"ALL":et); setPage(0); }} style={{
                  padding:"5px 10px", fontSize:10,
                  background: eventTypeFilter===et ? m.color+"22" : "#0d1420",
                  border:`1px solid ${eventTypeFilter===et ? m.color : "#1a2540"}`,
                  borderRadius:3, color: eventTypeFilter===et ? m.color : "#3a5070",
                  cursor:"pointer", fontFamily:"inherit", letterSpacing:1
                }}>{m.icon}</button>
              ))}
              <div style={{ width:1, height:20, background:"#1a2540", margin:"0 4px" }} />
              <button onClick={() => { setShowEventsOnly(!showEventsOnly); setPage(0); }} style={{
                padding:"5px 12px", background: showEventsOnly?"#7c83fd22":"#0d1420",
                border:`1px solid ${showEventsOnly?"#7c83fd":"#1a2540"}`,
                borderRadius:3, color: showEventsOnly?"#7c83fd":"#4a6fa5",
                cursor:"pointer", fontSize:10, fontFamily:"inherit", letterSpacing:1
              }}>EVENTS ONLY</button>
              <button onClick={() => { setShowExtremeOnly(!showExtremeOnly); setPage(0); }} style={{
                padding:"5px 12px", background: showExtremeOnly?"#ff6b3522":"#0d1420",
                border:`1px solid ${showExtremeOnly?"#ff6b35":"#1a2540"}`,
                borderRadius:3, color: showExtremeOnly?"#ff6b35":"#4a6fa5",
                cursor:"pointer", fontSize:10, fontFamily:"inherit", letterSpacing:1
              }}>±2%+ ONLY</button>
              <input
                placeholder="Search date or event…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                style={{ padding:"5px 10px", background:"#0d1420", border:"1px solid #1a2540", borderRadius:3, color:"#c8d8f0", fontSize:11, fontFamily:"inherit", outline:"none", width:200 }}
              />
              <div style={{ marginLeft:"auto", fontSize:11, color:"#3a5070" }}>{filtered.length} days</div>
            </div>

            <div style={{ background:"#0a0e18", border:"1px solid #1a2540", borderRadius:4, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"110px 50px 80px 80px 80px 130px 1fr", padding:"8px 16px", borderBottom:"1px solid #1a2540", background:"#080b12" }}>
                {["DATE","TYPE","QQQ","SPY","NDX","MOVE","EVENT"].map(h => (
                  <div key={h} style={{ fontSize:9, letterSpacing:2, color:"#2a3a55" }}>{h}</div>
                ))}
              </div>
              {paginated.length === 0 && (
                <div style={{ padding:32, textAlign:"center", color:"#2a3a55", fontSize:12 }}>NO DATA FOR FILTER</div>
              )}
              {paginated.map((row, i) => {
                const pct = (row[tCol] ?? row.qqq) as number;
                const m = row.et ? TYPE_META[row.et] : null;
                return (
                  <div key={row.date} style={{
                    display:"grid", gridTemplateColumns:"110px 50px 80px 80px 80px 130px 1fr",
                    padding:"6px 16px", borderBottom:"1px solid #0d1420",
                    background: row.et ? (m?.color+"09") : (i%2===0?"transparent":"#0b0f1a"),
                    borderLeft: row.et ? `3px solid ${m?.color}` : "3px solid transparent",
                  }}>
                    <div style={{ fontSize:11, color:"#6a8ab5", letterSpacing:1 }}>{row.date}</div>
                    <div style={{ fontSize:9, color: m?.color ?? "#2a3a55", fontWeight:700 }}>{m?.icon ?? "—"}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:pctColor(row.qqq) }}>{row.qqq>=0?"+":""}{row.qqq.toFixed(3)}%</div>
                    <div style={{ fontSize:12, color:pctColor(row.spy??0) }}>{row.spy!=null?(row.spy>=0?"+":"")+row.spy.toFixed(3)+"%":"—"}</div>
                    <div style={{ fontSize:12, color:pctColor(row.ndx??0) }}>{row.ndx!=null?(row.ndx>=0?"+":"")+row.ndx.toFixed(3)+"%":"—"}</div>
                    <Bar pct={pct} maxAbs={5} />
                    <div style={{ fontSize:10, color: m?.color ?? "#2a3a55", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {row.en ?? ""}
                      {row.en && <span style={{ fontSize:9, color:"#3a5070", marginLeft:8 }}>{row.ed?.slice(0,90)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:14, alignItems:"center" }}>
                <button onClick={() => setPage(Math.max(0,page-1))} disabled={page===0} style={{
                  padding:"5px 14px", background:"#0d1420", border:"1px solid #1a2540", borderRadius:3,
                  color: page===0?"#2a3a55":"#4a6fa5", cursor:page===0?"not-allowed":"pointer", fontSize:11, fontFamily:"inherit"
                }}>← PREV</button>
                <span style={{ fontSize:11, color:"#3a5070" }}>{page+1}/{totalPages} · {filtered.length} rows</span>
                <button onClick={() => setPage(Math.min(totalPages-1,page+1))} disabled={page===totalPages-1} style={{
                  padding:"5px 14px", background:"#0d1420", border:"1px solid #1a2540", borderRadius:3,
                  color: page===totalPages-1?"#2a3a55":"#4a6fa5", cursor:page===totalPages-1?"not-allowed":"pointer", fontSize:11, fontFamily:"inherit"
                }}>NEXT →</button>
              </div>
            )}
          </div>
        )}

        {/* ── EVENT ANALYSIS ── */}
        {tab === "EVENT ANALYSIS" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:"#3a5070", marginBottom:12 }}>QQQ AVG RETURN BY EVENT TYPE · 2023–2026</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...typeStats].sort((a,b) => b.avg - a.avg).map(ts => {
                  const m = TYPE_META[ts.type] ?? { color:"#aaa" };
                  const barW = Math.min(Math.abs(ts.avg) / 1.5 * 100, 100);
                  return (
                    <div key={ts.type} style={{ background:"#0d1420", border:"1px solid #1a2540", borderRadius:4, padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                        <div style={{ fontSize:11, color:m.color, fontWeight:700, width:150, letterSpacing:2 }}>{ts.type.toUpperCase()}</div>
                        <div style={{ flex:1, height:14, background:"#080b12", borderRadius:2, overflow:"hidden" }}>
                          <div style={{
                            height:"100%", width: barW+"%", minWidth:2,
                            background: ts.avg>=0 ? `linear-gradient(90deg,${m.color}44,${m.color})` : "linear-gradient(90deg,#ff222244,#ff2222)",
                            borderRadius:2
                          }} />
                        </div>
                        <div style={{ fontSize:14, fontWeight:700, color: ts.avg>=0?"#00ff9d":"#ff6b6b", width:80, textAlign:"right" }}>
                          {ts.avg>=0?"+":""}{ts.avg.toFixed(3)}%
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:20, fontSize:10, color:"#4a6fa5" }}>
                        <span>{ts.count} events</span>
                        <span style={{ color:"#00ff9d" }}>↑ {ts.up} up</span>
                        <span style={{ color:"#ff6b6b" }}>↓ {ts.down} down</span>
                        <span style={{ color:"#ff9f43" }}>σ {ts.vol.toFixed(3)}%</span>
                        <span style={{ color:"#3a5070" }}>win rate {ts.count>0?((ts.up/ts.count)*100).toFixed(0):0}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background:"#0d1420", border:"1px solid #1a2540", borderRadius:4, padding:"16px 20px" }}>
              <div style={{ fontSize:10, letterSpacing:3, color:"#3a5070", marginBottom:12 }}>KEY FINDINGS</div>
              {[
                { color:"#a29bfe", text:"AI announcements are the strongest catalyst: avg +0.46% QQQ, 8/9 events positive. DeepSeek (Jan 27 2025) was the only exception — NVDA dragged the index -3.8% intraday." },
                { color:"#fd79a8", text:"Banking crisis days (SVB, Signature Bank) average +0.96% — markets front-run FDIC/Fed bailout announcements and relief bounces faster than the selloff." },
                { color:"#7c83fd", text:"Fed days are a perfect coin flip: avg +0.07%, exactly 7 up / 7 down. Direction depends entirely on wording vs expectations, not the decision itself." },
                { color:"#ff9f43", text:"Macro data days (CPI, jobs) skew negative: avg -0.48%. Upside surprises trigger rate-hike fears; misses trigger recession fears. Either way, tech loses." },
                { color:"#ff6b35", text:"Political events carry the highest volatility (σ=4.32%) — the Apr 9 tariff pause (+12.1%) and Apr 8 tariff escalation (-5.0%) are the same category. Direction is unpredictable, magnitude is guaranteed." },
                { color:"#55efc4", text:"IPO days have a slight negative drag (-0.20%). Large offerings absorb secondary market capital; also tend to cluster in risk-off windows (Birkenstock, CoreWeave both disappointed)." },
                { color:"#e8edf5", text:"The core edge: event days have 2.55× higher volatility than non-event days (2.15% vs 0.84%). Accurately predicting event direction yields dramatically larger payoffs than random trading." },
              ].map((ins, i) => (
                <div key={i} style={{ display:"flex", gap:12, marginBottom:10, paddingBottom:10, borderBottom:"1px solid #0d1420" }}>
                  <div style={{ width:4, minWidth:4, background:ins.color, borderRadius:2, alignSelf:"stretch" }} />
                  <div style={{ fontSize:12, color:"#8a9ab5", lineHeight:1.6 }}>{ins.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TOP MOVES ── */}
        {tab === "TOP MOVES" && (
          <div>
            {(["BEST", "WORST"] as const).map(dir => {
              const sorted = [...rows].sort((a,b) => dir==="BEST" ? b.qqq-a.qqq : a.qqq-b.qqq).slice(0,20);
              return (
                <div key={dir} style={{ marginBottom:28 }}>
                  <div style={{ fontSize:10, letterSpacing:3, color:"#3a5070", marginBottom:10 }}>
                    {dir==="BEST" ? "TOP 20 BEST DAYS (QQQ)" : "TOP 20 WORST DAYS (QQQ)"}
                  </div>
                  <div style={{ background:"#0a0e18", border:"1px solid #1a2540", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"110px 80px 80px 80px 160px 1fr", padding:"7px 16px", borderBottom:"1px solid #1a2540", background:"#080b12" }}>
                      {["DATE","QQQ","SPY","NDX","TYPE","EVENT"].map(h => (
                        <div key={h} style={{ fontSize:9, letterSpacing:2, color:"#2a3a55" }}>{h}</div>
                      ))}
                    </div>
                    {sorted.map((row, i) => {
                      const m = row.et ? TYPE_META[row.et] : null;
                      return (
                        <div key={row.date} style={{
                          display:"grid", gridTemplateColumns:"110px 80px 80px 80px 160px 1fr",
                          padding:"7px 16px", borderBottom:"1px solid #0d1420",
                          background: i%2===0?"transparent":"#0b0f1a",
                          borderLeft: m ? `3px solid ${m.color}` : "3px solid transparent"
                        }}>
                          <div style={{ fontSize:11, color:"#6a8ab5" }}>{row.date}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:pctColor(row.qqq) }}>{row.qqq>=0?"+":""}{row.qqq.toFixed(3)}%</div>
                          <div style={{ fontSize:12, color:pctColor(row.spy??0) }}>{row.spy!=null?(row.spy>=0?"+":"")+row.spy.toFixed(2)+"%":"—"}</div>
                          <div style={{ fontSize:12, color:pctColor(row.ndx??0) }}>{row.ndx!=null?(row.ndx>=0?"+":"")+row.ndx.toFixed(2)+"%":"—"}</div>
                          <div style={{ fontSize:10, color: m?.color ?? "#2a3a55", fontWeight:700 }}>{row.et ?? <span style={{ color:"#2a3a55" }}>No event tagged</span>}</div>
                          <div style={{ fontSize:10, color:"#6a8ab5", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {row.en ?? <span style={{ color:"#2a3a55" }}>Untagged move — likely intraday/options flow</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CORRELATION ── */}
        {tab === "CORRELATION" && (
          <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:"#3a5070", marginBottom:10 }}>
                QQQ−SPY SPREAD BY EVENT TYPE · tech outperformance vs broad market
              </div>
              <div style={{ background:"#0d1420", border:"1px solid #1a2540", borderRadius:4, padding:16 }}>
                {(() => {
                  const byType: Record<string, number[]> = {};
                  for (const r of rows) {
                    if (!r.et || r.spy == null) continue;
                    const spread = r.qqq - r.spy;
                    if (!byType[r.et]) byType[r.et] = [];
                    byType[r.et].push(spread);
                  }
                  const entries = Object.entries(byType).map(([et, spreads]) => ({
                    et, avg: spreads.reduce((a,b)=>a+b,0)/spreads.length, n: spreads.length
                  })).sort((a,b) => b.avg - a.avg);
                  return entries.map(e => {
                    const m = TYPE_META[e.et] ?? { color:"#aaa" };
                    return (
                      <div key={e.et} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                        <div style={{ fontSize:11, color:m.color, fontWeight:700, width:165, flexShrink:0 }}>{e.et.toUpperCase()}</div>
                        <div style={{ flex:1, height:10, background:"#080b12", borderRadius:2, overflow:"hidden", position:"relative" }}>
                          <div style={{ position:"absolute", left:"50%", top:0, width:1, height:"100%", background:"#1a2540" }} />
                          <div style={{
                            position:"absolute",
                            left: e.avg>=0 ? "50%" : `${Math.max(0, 50 + e.avg * 8)}%`,
                            width: `${Math.min(Math.abs(e.avg)*8, 50)}%`,
                            height:"100%",
                            background: e.avg>=0 ? `linear-gradient(90deg,${m.color}44,${m.color})` : "linear-gradient(90deg,#ff222244,#ff2222)",
                          }} />
                        </div>
                        <div style={{ fontSize:12, fontWeight:700, color: e.avg>=0?"#00d4ff":"#ff6b6b", width:80, textAlign:"right" }}>
                          {e.avg>=0?"+":""}{e.avg.toFixed(3)}%
                        </div>
                        <div style={{ fontSize:10, color:"#3a5070", width:60 }}>{e.n} events</div>
                      </div>
                    );
                  });
                })()}
                <div style={{ marginTop:12, fontSize:11, color:"#3a5070", lineHeight:1.8 }}>
                  <span style={{ color:"#00d4ff" }}>Positive spread</span> = QQQ outperformed SPY (tech beat broad market). AI and Earnings events show strongest tech outperformance.
                  Macro and Geopolitical events show SPY outperforming (defensive rotation out of tech).
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize:10, letterSpacing:3, color:"#3a5070", marginBottom:10 }}>MONTHLY AVG DAILY QQQ RETURN HEATMAP</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {(() => {
                  const monthly: Record<string, number[]> = {};
                  for (const r of rows) {
                    const key = r.date.slice(0,7);
                    if (!monthly[key]) monthly[key] = [];
                    monthly[key].push(r.qqq);
                  }
                  return Object.entries(monthly).sort((a,b)=>a[0].localeCompare(b[0])).map(([month, vals]) => {
                    const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
                    const intensity = Math.min(Math.abs(avg)/1.5, 1);
                    const bg = avg>=0 ? `rgba(0,255,157,${intensity*0.65})` : `rgba(255,60,60,${intensity*0.65})`;
                    return (
                      <div key={month} title={`${month}: avg ${avg.toFixed(3)}%/day · ${vals.length} sessions`} style={{
                        width:58, padding:"6px 4px", background:bg,
                        border:"1px solid rgba(255,255,255,0.06)", borderRadius:3, textAlign:"center"
                      }}>
                        <div style={{ fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:0.5 }}>{month.slice(2).replace("-","'")}</div>
                        <div style={{ fontSize:10, fontWeight:700, color: avg>=0?"#00ff9d":"#ff6b6b" }}>
                          {avg>=0?"+":""}{avg.toFixed(2)}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:28, paddingTop:16, borderTop:"1px solid #0d1420", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <div style={{ fontSize:10, color:"#2a3a55", letterSpacing:1 }}>
            DATA: YAHOO FINANCE · OPEN→CLOSE INTRADAY RETURN · NOT ADJUSTED FOR DIVIDENDS · INFORMATIONAL USE ONLY
          </div>
          <div style={{ display:"flex", gap:16, fontSize:11 }}>
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" style={{ color:"#4a6fa5", textDecoration:"none" }}>@Trace_Cohen</a>
            <a href="mailto:t@nyvp.com" style={{ color:"#4a6fa5", textDecoration:"none" }}>t@nyvp.com</a>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080b12; }
        ::-webkit-scrollbar-thumb { background: #1a2540; border-radius: 3px; }
        input::placeholder { color: #2a3a55; }
        button { transition: all 0.12s; }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
