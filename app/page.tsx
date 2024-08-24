import PomodoroTimer from '@/components/PomodoroTimer'

export default async function Home() {
  // if (!session) {
  //   redirect('/login')
  // }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pomodoro Timer</h1>
      <PomodoroTimer />
    </main>
  )
}
