import PomodoroTimer from '@/components/PomodoroTimer'

export default async function Home() {
  // if (!session) {
  //   redirect('/login')
  // }

  return (
    <main className="container mx-auto p-4">
      <PomodoroTimer />
    </main>
  )
}
