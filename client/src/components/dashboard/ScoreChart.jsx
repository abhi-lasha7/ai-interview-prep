import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ScoreChart({ interviews }) {
  const data = interviews
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((interview, index) => ({
      name: `Interview ${index + 1}`,
      score: interview.overallScore || 0,
      date: new Date(interview.createdAt).toLocaleDateString()
    }));

  return (
    <div style={{ width: '100%', height: 300, marginTop: '30px' }}>
      <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>📈 Your Score Progress</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" domain={[0, 10]} />
          <Tooltip 
            contentStyle={{ background: '#1a1a2e', border: '1px solid #667eea' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#667eea" 
            strokeWidth={3}
            dot={{ fill: '#667eea', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}