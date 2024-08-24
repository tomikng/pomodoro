import React from 'react'
import { BarChart, Clock, Coffee, Moon, LucideIcon } from 'lucide-react'

interface StatBoxProps {
  title: string
  time: string
  icon: LucideIcon
}

const StatBox: React.FC<StatBoxProps> = ({ title, time, icon: Icon }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-lg font-semibold text-card-foreground">{title}</h4>
      <Icon className="text-primary" size={24} />
    </div>
    <p className="text-3xl font-bold text-primary">{time}</p>
  </div>
)

interface ImprovedStatisticsProps {
  totalFocusTime: string
  totalBreakTime: string
  totalLongBreakTime: string
}

const ImprovedStatistics: React.FC<ImprovedStatisticsProps> = ({
  totalFocusTime,
  totalBreakTime,
  totalLongBreakTime,
}) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 flex items-center text-foreground">
        <BarChart className="mr-2 text-primary" /> Statistics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox title="Focus Time" time={totalFocusTime} icon={Clock} />
        <StatBox title="Breaks" time={totalBreakTime} icon={Coffee} />
        <StatBox title="Long Breaks" time={totalLongBreakTime} icon={Moon} />
      </div>
    </div>
  )
}

export default ImprovedStatistics
