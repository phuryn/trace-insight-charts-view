
import { TraceRecord, DailyStats } from '@/types/trace';

// Generate records for the last 7 days
const generateRecords = (): TraceRecord[] => {
  const records: TraceRecord[] = [];
  const now = new Date();
  
  for (let i = 0; i < 70; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(i / 10)); // 10 records per day for 7 days
    
    records.push({
      id: `trace-${i}`,
      status: ['Pending', 'Accepted', 'Rejected'][Math.floor(Math.random() * 3)] as any,
      llmScore: Math.random() > 0.5 ? 'Pass' : 'Fail',
      userMessage: `This is a sample user message ${i}`,
      assistantResponse: `This is a sample assistant response ${i}`,
      editableOutput: `This is a sample assistant response ${i}`,
      date: date.toISOString(),
    });
  }
  
  return records;
};

// Calculate daily agreement rate and acceptance rate
export const getDailyStats = (): DailyStats[] => {
  const records = generateRecords();
  const stats: { [key: string]: { total: number, accepted: number, agreed: number, evaluated: number } } = {};
  
  // Group by day
  records.forEach(record => {
    const date = record.date.split('T')[0];
    if (!stats[date]) {
      stats[date] = { total: 0, accepted: 0, agreed: 0, evaluated: 0 };
    }
    
    stats[date].total += 1;
    
    if (record.status !== 'Pending') {
      stats[date].evaluated += 1;
      
      if (record.status === 'Accepted') {
        stats[date].accepted += 1;
      }
      
      // Determine agreement: Accepted->Pass or Rejected->Fail is considered agreement
      const humanAccepted = record.status === 'Accepted';
      const modelPassed = record.llmScore === 'Pass';
      if ((humanAccepted && modelPassed) || (!humanAccepted && !modelPassed)) {
        stats[date].agreed += 1;
      }
    }
  });
  
  // Calculate rates for each day
  const dailyStats: DailyStats[] = Object.entries(stats).map(([date, data]) => {
    return {
      date,
      agreementRate: data.evaluated > 0 ? (data.agreed / data.evaluated) * 100 : 0,
      acceptanceRate: data.evaluated > 0 ? (data.accepted / data.evaluated) * 100 : 0
    };
  });
  
  // Sort by date ascending
  return dailyStats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getRecords = (): TraceRecord[] => {
  return generateRecords();
};
