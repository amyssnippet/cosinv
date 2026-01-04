import ActivityCalendar from 'react-activity-calendar'

// Generate mock data for the past year
const generateMockData = () => {
  const data = []
  const today = new Date()
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Random activity level (0-4)
    const level = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: level * 2,
      level: level as 0 | 1 | 2 | 3 | 4,
    })
  }
  
  return data
}

const mockData = generateMockData()

export default function ActivityHeatmap() {
  return (
    <div className="overflow-x-auto pb-2">
      <ActivityCalendar
        data={mockData}
        theme={{
          light: ['#1a1a2e', '#312e81', '#4338ca', '#6366f1', '#818cf8'],
          dark: ['#1a1a2e', '#312e81', '#4338ca', '#6366f1', '#818cf8'],
        }}
        colorScheme="dark"
        blockSize={12}
        blockMargin={4}
        fontSize={12}
        labels={{
          totalCount: '{{count}} activities in the last year',
        }}
      />
    </div>
  )
}
