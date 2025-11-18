const prisma = require('../services/prisma');

const fallbackStats = {
  totals: {
    users: 18452,
    activePlans: 12907,
    pendingCheckups: 143,
    refundRequests: 12,
  },
  recentUsers: [
    { name: 'Anjali Sharma', stage: 'Stage 3', coach: 'Neha', lastCheckIn: '20 Sept', status: 'Active' },
    { name: 'Rohit Singh', stage: 'Stage 2', coach: 'Vivek', lastCheckIn: '18 Sept', status: 'Needs Follow-up' },
    { name: 'Aditi Rao', stage: 'Stage 4', coach: 'Riya', lastCheckIn: '22 Sept', status: 'Active' },
  ],
  activities: [
    { label: 'New user registered', value: 'Sana added her assessment · 2m ago' },
    { label: 'Coach reassigned', value: 'Dev now guiding Rahul · 12m ago' },
    { label: 'Refund requested', value: 'Ticket #RF-209 · 30m ago' },
  ],
};

exports.getStats = async (req, res) => {
  if (!prisma) {
    return res.json(fallbackStats);
  }

  try {
    const [usersCount, activePlans, pendingCheckups, refunds] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count({ where: { planStatus: 'active' } }),
      prisma.touchpoint.count({ where: { status: 'pending' } }),
      prisma.activity.count({ where: { action: 'refund_requested' } }),
    ]);

    res.json({
      totals: {
        users: usersCount,
        activePlans,
        pendingCheckups,
        refundRequests: refunds,
      },
      recentUsers: fallbackStats.recentUsers,
      activities: fallbackStats.activities,
    });
  } catch (error) {
    console.error('Admin stats error', error);
    res.json(fallbackStats);
  }
};

exports.listUsers = async (req, res) => {
  if (!prisma) {
    return res.json(fallbackStats.recentUsers);
  }

  try {
    const users = await prisma.user.findMany({
      take: 25,
      include: { profile: { include: { coach: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = users.map((user) => ({
      name: user.name,
      stage: user.profile?.stage,
      coach: user.profile?.coach?.name,
      lastCheckIn: user.updatedAt.toISOString(),
      status: user.profile?.planStatus || 'Active',
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Admin list users error', error);
    res.json(fallbackStats.recentUsers);
  }
};
