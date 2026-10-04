export type RewardId =
  | 'candy'
  | 'bubble'
  | 'capsule'
  | 'box'
  | 'pill'
  | 'blue_pack'
  | 'purple_pack'
  | 'orange_pack'

export type Reward = { id: RewardId; label: string; amount: number; displayAmount: string }
export type Milestone = { id: number; points: number; rewards: Reward[] }
export type EventData = { id: string; name: string; active?: boolean; milestones: Milestone[] }

const reward = (id: RewardId, label: string, amount: number, displayAmount: string): Reward => ({ id, label, amount, displayAmount })
const candy = (displayAmount: string) => reward('candy', 'Candy', Number(displayAmount.replace('K', '000').replace('M', '000000')), displayAmount)
const item = (id: RewardId, label: string, amount: number) => reward(id, label, amount, String(amount))
const bubble = (amount: number) => item('bubble', 'Pinball', amount)
const capsule = (amount: number) => item('capsule', 'Egg', amount)
const box = (amount: number) => item('box', 'Wishbox', amount)
const pill = (amount: number) => item('pill', 'Pill', amount)
const bluePack = (amount: number) => item('blue_pack', 'Blue Pack', amount)
const purplePack = (amount: number) => item('purple_pack', 'Purple Pack', amount)
const orangePack = (amount: number) => item('orange_pack', 'Orange Pack', amount)

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
  { id: 'fishing', name: 'Fishing Contest', milestones: [] },
  { id: 'treasure', name: 'Treasure Hunt', milestones: [] },
  { id: 'raft', name: 'Raft Race', milestones: [] },
  { id: 'zobo', name: 'Zobo Shooter', milestones: [] },
  { id: 'cozy-farm', name: 'Cozy Farm', active: true, milestones: cozyRows },
]
