const prisma = require('../services/prisma');

const fallbackDashboard = {
  profile: {
    name: 'Anjali Sharma',
    userId: 'INF-2483',
    coach: 'Neha Patel',
    stage: 'Stage 3',
    avatarUrl: 'assets/images/hero-couple.jpg',
  },
  assessment: {
    score: 82,
    focusAreas: ['Nutrition', 'Stress', 'DHT'],
  },
  medications: [
    { schedule: 'Morning', items: ['Hair Ras', 'Defence Shampoo'] },
    { schedule: 'Evening', items: ['Calm Ras', 'Nourish Oil'] },
    { schedule: 'Weekly', items: ['Detox Mask'] },
  ],
  touchpoints: [
    { label: 'Coach Check-in', value: 'Tue, 24 Sept · 5:30 PM' },
    { label: 'Progress Photos', value: 'Due this weekend' },
    { label: 'Refill Reminder', value: 'Next week' },
  ],
};

exports.getDashboard = async (req, res) => {
  if (!prisma) {
    return res.json(fallbackDashboard);
  }

  try {
    const user = await prisma.user.findFirst({
      include: {
        profile: { include: { coach: true } },
        medications: { include: { medication: true } },
        touchpoints: true,
      },
    });

    if (!user) {
      return res.json(fallbackDashboard);
    }

    const response = {
      profile: {
        name: user.name,
        userId: user.id,
        coach: user.profile?.coach?.name,
        stage: user.profile?.stage,
        avatarUrl: user.avatarUrl,
      },
      assessment: {
        score: user.profile?.assessment || 0,
        focusAreas: user.profile?.focusAreas?.split(',') || [],
      },
      medications: user.medications.map((entry) => ({
        schedule: entry.schedule,
        items: [entry.medication?.name].filter(Boolean),
      })),
      touchpoints: user.touchpoints.slice(0, 3).map((point) => ({
        label: point.type,
        value: new Date(point.scheduledAt).toLocaleString(),
      })),
    };

    res.json(response);
  } catch (error) {
    console.error('Dashboard error', error);
    res.json(fallbackDashboard);
  }
};
