export type RewardId =
  | 'candy'
  | 'bubble'
  | 'capsule'
  | 'box'
  | 'pill'
  | 'blue_pack'
  | 'purple_pack'
  | 'orange_pack'
  | 'premium_rod'
  | 'heirloom_rod'
  | 'felicia_rod'
  | 'glitter_fruit'

export type Reward = { id: RewardId; label: string; amount: number; displayAmount: string }
export type Milestone = { id: number; points: number; rewards: Reward[] }
export type EventData = { id: string; name: string; active?: boolean; milestones: Milestone[] }

const reward = (id: RewardId, label: string, amount: number, displayAmount: string): Reward => ({ id, label, amount, displayAmount })
const candy = (displayAmount: string) => reward('candy', 'Candy', Number(displayAmount.replace(/,/g, '').replace('K', '000').replace('M', '000000')), displayAmount)
const item = (id: RewardId, label: string, amount: number) => reward(id, label, amount, String(amount))
const bubble = (amount: number) => item('bubble', 'Pinball', amount)
const capsule = (amount: number) => item('capsule', 'Egg', amount)
const box = (amount: number) => item('box', 'Wishbox', amount)
const pill = (amount: number) => item('pill', 'Pill', amount)
const bluePack = (amount: number) => item('blue_pack', 'Blue Pack', amount)
const purplePack = (amount: number) => item('purple_pack', 'Purple Pack', amount)
const orangePack = (amount: number) => item('orange_pack', 'Orange Pack', amount)
const premiumRod = (amount: number) => item('premium_rod', 'Premium Rod', amount)
const heirloomRod = (amount: number) => item('heirloom_rod', 'Heirloom Rod', amount)
const feliciaRod = (amount: number) => item('felicia_rod', "Felicia's Rod", amount)

const fishingRows: Milestone[] = [
  [1000, [bubble(30), candy('56,700')]],
  [5000, [bubble(30), candy('56,700')]],
  [10000, [bubble(30), capsule(5), candy('56,700')]],
  [20000, [bubble(30), candy('56,700')]],
  [50000, [bubble(30), candy('56,700'), pill(50)]],
  [100000, [bubble(60), capsule(5), bluePack(1)]],
  [200000, [bubble(30), candy('113K')]],
  [300000, [box(2), bubble(30), candy('226K')]],
  [400000, [bubble(30), candy('113K')]],
  [500000, [bubble(30), candy('113K')]],
  [600000, [bubble(90), capsule(10), purplePack(1)]],
  [800000, [premiumRod(1), bubble(30), candy('113K')]],
  [1000000, [bubble(30), capsule(10), candy('113K')]],
  [1200000, [bubble(60), candy('113K'), pill(50)]],
  [1400000, [box(3), bubble(120), candy('340K')]],
  [1600000, [bubble(120), bluePack(1)]],
  [1800000, [bubble(120), capsule(10), candy('453K')]],
  [2000000, [bubble(120), candy('453K')]],
  [2200000, [heirloomRod(1), bubble(150), candy('567K')]],
  [2400000, [bubble(150), capsule(10), candy('567K')]],
  [2600000, [bubble(240), candy('567K')]],
  [2800000, [bubble(120), candy('680K'), pill(100)]],
  [3000000, [bubble(180), capsule(10), candy('1020K')]],
  [3200000, [bubble(120), purplePack(1)]],
  [3400000, [bubble(120), candy('453K')]],
  [3600000, [bubble(120), candy('453K')]],
  [3800000, [bubble(150), capsule(15), candy('567K')]],
  [4000000, [bubble(120), candy('567K')]],
  [4200000, [bubble(120), candy('567K')]],
  [4400000, [bubble(180), capsule(15), candy('680K')]],
  [4600000, [bubble(180), candy('680K')]],
  [4800000, [bubble(180), candy('680K')]],
  [5000000, [bubble(240), capsule(15), orangePack(1)]],
  [5200000, [bubble(120), candy('453K')]],
  [5400000, [bubble(120), candy('453K')]],
  [5600000, [feliciaRod(1), bubble(120), candy('453K')]],
  [5800000, [bubble(150), capsule(20), candy('567K')]],
  [6000000, [bubble(150), candy('567K')]],
  [6200000, [bubble(150), candy('567K'), pill(100)]],
  [6400000, [bubble(180), candy('680K')]],
  [6600000, [box(5), bubble(240), candy('1530K')]],
  [6800000, [bubble(180), candy('680K')]],
  [7000000, [bubble(180), candy('680K')]],
  [7200000, [bubble(300), capsule(20), purplePack(1)]],
  [7500000, [bubble(180), candy('680K'), pill(100)]],
  [8000000, [box(5), bubble(360), candy('1530K')]],
  [8500000, [bubble(180), candy('680K')]],
  [9000000, [bubble(360), capsule(20), candy('1530K')]],
  [9500000, [bubble(180), candy('680K'), pill(100)]],
  [10000000, [box(5), bubble(360), orangePack(1)]],
  [10500000, [bubble(180), candy('680K')]],
  [11000000, [bubble(180), candy('680K')]],
  [11500000, [bubble(180), candy('680K')]],
  [12000000, [bubble(240), capsule(30), candy('1020K')]],
  [12500000, [bubble(180), candy('680K')]],
  [13000000, [bubble(180), candy('680K')]],
  [13500000, [bubble(180), candy('680K')]],
  [14000000, [bubble(180), candy('680K')]],
  [14500000, [bubble(180), candy('680K')]],
  [15000000, [bubble(300), capsule(30), purplePack(1)]],
  [15500000, [bubble(180), candy('680K')]],
  [16000000, [bubble(180), candy('680K')]],
  [16500000, [bubble(180), candy('680K')]],
  [17000000, [bubble(180), candy('680K')]],
  [17500000, [bubble(180), candy('680K')]],
  [18000000, [bubble(450), capsule(30), candy('1927K')]],
  [18500000, [bubble(180), candy('680K')]],
  [19000000, [bubble(180), candy('680K')]],
  [19500000, [bubble(180), candy('680K')]],
  [20000000, [box(5), bubble(600), orangePack(1)]],
].map(([points, rewards], index) => ({ id: index + 1, points: points as number, rewards: rewards as Reward[] }))

const row = (id: number, points: number, first: Reward, second: Reward): Milestone => ({ id, points, rewards: [first, second] })
const c = (points: number, first: Reward, second: Reward) => ({ points, first, second })

const cozyRows = [
  c(150, bubble(60), candy('124K')), c(2000, candy('124K'), capsule(3)), c(3200, candy('124K'), box(1)), c(4200, candy('124K'), bluePack(1)), c(5300, candy('124K'), purplePack(1)),
  c(6300, bubble(60), candy('124K')), c(7400, candy('124K'), capsule(3)), c(8400, candy('124K'), box(1)), c(9600, bubble(60), candy('124K')), c(10600, candy('124K'), capsule(4)),
  c(11800, bubble(60), candy('124K')), c(12800, candy('124K'), capsule(5)), c(13900, candy('124K'), box(1)), c(15100, bubble(60), candy('124K')), c(16000, candy('124K'), pill(50)),
  c(17100, candy('124K'), purplePack(1)), c(18200, bubble(60), candy('124K')), c(19300, candy('124K'), box(1)), c(20000, candy('124K'), capsule(5)), c(21900, bubble(60), candy('124K')),
  c(23000, candy('124K'), capsule(5)), c(24000, bubble(60), candy('124K')), c(25100, candy('124K'), box(1)), c(26000, candy('124K'), capsule(5)), c(27000, bubble(60), pill(50)),
  c(33200, bubble(75), candy('464K')), c(35100, candy('464K'), box(1)), c(37000, candy('464K'), purplePack(1)), c(41100, bubble(75), pill(100)), c(42900, bubble(90), candy('464K')),
  c(44700, candy('464K'), box(1)), c(48500, bubble(90), candy('491K')), c(53400, bubble(135), candy('232K')), c(57600, capsule(10), pill(100)), c(59800, candy('232K'), box(1)),
  c(64090, candy('232K'), orangePack(1)), c(66090, bubble(135), candy('232K')), c(70300, candy('232K'), capsule(10)), c(74500, candy('232K'), box(1)), c(76590, bubble(150), pill(100)),
  c(88000, bubble(150), candy('354K')), c(95000, candy('354K'), capsule(7)), c(99000, candy('354K'), box(1)), c(105000, bubble(150), candy('709K')), c(112000, bubble(150), bluePack(1)),
  c(119000, candy('354K'), capsule(7)), c(125000, bubble(150), candy('354K')), c(130000, candy('354K'), box(1)), c(136000, bubble(150), candy('709K')), c(142000, capsule(7), orangePack(1)),
  c(149000, bubble(150), candy('354K')), c(156000, bubble(150), candy('354K')), c(160000, candy('354K'), capsule(7)), c(165000, candy('354K'), box(1)), c(172000, bubble(150), candy('354K')),
  c(179000, bubble(150), candy('354K')), c(185000, candy('354K'), capsule(7)), c(189000, bubble(150), candy('409K')), c(227000, bubble(375), candy('723K')), c(260000, candy('723K'), capsule(10)),
  c(291000, candy('723K'), box(2)), c(322000, candy('723K'), pill(100)), c(353000, candy('723K'), purplePack(1)), c(386000, candy('723K'), capsule(5)), c(418000, bubble(375), candy('723K')),
  c(448000, candy('723K'), capsule(10)), c(479000, bubble(375), candy('723K')), c(512000, candy('723K'), capsule(10)), c(542000, candy('723K'), box(3)), c(573000, bubble(375), candy('723K')),
  c(603000, candy('723K'), capsule(10)), c(636000, bubble(375), candy('723K')), c(666000, candy('723K'), capsule(5)), c(697000, candy('723K'), purplePack(1)), c(728000, bubble(375), candy('723K')),
  c(758000, candy('723K'), capsule(10)), c(789000, candy('723K'), box(3)), c(819000, bubble(375), candy('723K')), c(848000, candy('723K'), capsule(10)), c(879000, bubble(375), candy('723K')),
  c(910000, candy('846K'), capsule(10)), c(939000, bubble(90), candy('573K')), c(968000, candy('573K'), capsule(5)), c(997000, candy('573K'), box(2)), c(1020000, candy('573K'), pill(100)),
  c(1050000, candy('573K'), orangePack(1)), c(1080000, bubble(90), candy('573K')), c(1110000, candy('573K'), capsule(5)), c(1130000, candy('573K'), box(2)), c(1160000, bubble(105), candy('573K')),
  c(1190000, candy('573K'), capsule(5)), c(1220000, candy('1146K'), box(2)), c(1250000, bubble(105), orangePack(1)), c(1280000, candy('573K'), capsule(5)), c(1310000, candy('573K'), box(2)),
  c(1330000, bubble(105), candy('573K')), c(1360000, candy('573K'), capsule(5)), c(1390000, candy('573K'), box(2)), c(1420000, bubble(105), candy('573K')), c(1450000, candy('1692K'), orangePack(1)),
].map((entry, index) => row(index + 1, entry.points, entry.first, entry.second))

export const events: EventData[] = [
  { id: 'fishing', name: 'Fishing Tournament', milestones: fishingRows },
  { id: 'treasure', name: 'Treasure Hunt', milestones: [] },
  { id: 'raft', name: 'Raft Race', milestones: [] },
  { id: 'zobo', name: 'Zobo Shooter', milestones: [] },
  { id: 'cozy-farm', name: 'Cozy Farm', active: true, milestones: cozyRows },
]
