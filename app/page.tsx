import PomodoroTimer from '@/components/PomodoroTimer'
import AnimatedBackground from '@/components/AnimatedBackground'

export default async function Home() {
  return (
    <main className="container mx-auto p-4 relative">
      <AnimatedBackground />
      <PomodoroTimer />
    </main>
  )
}
