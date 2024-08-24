'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { AlertCircle, Clock, BarChart } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { gsap } from 'gsap'
import ImprovedStatistics from '@/components/ImprovedStatistics'

export default function PomodoroTimer() {
  const [sessionTime, setSessionTime] = useState<number>(25)
  const [breakTime, setBreakTime] = useState<number>(5)
  const [longBreakTime, setLongBreakTime] = useState<number>(15)
  const [timeLeft, setTimeLeft] = useState<number>(sessionTime * 60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [sessionCount, setSessionCount] = useState<number>(0)
  const [isBreak, setIsBreak] = useState<boolean>(false)
  const [trackProgress, setTrackProgress] = useState<boolean>(false)
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0)
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0)
  const [totalLongBreakTime, setTotalLongBreakTime] = useState<number>(0)

  const timerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
        if (!isBreak) setTotalFocusTime((prev) => prev + 1)
        else if (sessionCount % 4 === 0)
          setTotalLongBreakTime((prev) => prev + 1)
        else setTotalBreakTime((prev) => prev + 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionEnd()
    }
    return () => clearTimeout(timer)
  }, [
    isRunning,
    timeLeft,
    sessionTime,
    breakTime,
    longBreakTime,
    isBreak,
    sessionCount,
  ])

  useEffect(() => {
    animateTimer()
  }, [timeLeft])

  useEffect(() => {
    animateDots()
  }, [sessionCount])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning || sessionCount > 0) {
        e.preventDefault()
        e.returnValue =
          'You have an active Pomodoro session. Are you sure you want to leave?'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isRunning, sessionCount])

  const handleSessionEnd = (): void => {
    if (isBreak) {
      setIsBreak(false)
      setTimeLeft(sessionTime * 60)
    } else {
      setSessionCount((prevCount) => prevCount + 1)
      if (sessionCount % 4 === 3) {
        setIsBreak(true)
        setTimeLeft(longBreakTime * 60)
      } else {
        setIsBreak(true)
        setTimeLeft(breakTime * 60)
      }
    }
  }

  const toggleTimer = (): void => setIsRunning(!isRunning)

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const calculateProgress = (): number => {
    const totalTime = isBreak
      ? (sessionCount % 4 === 0 ? longBreakTime : breakTime) * 60
      : sessionTime * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const animateTimer = (): void => {
    if (timerRef.current) {
      gsap.to(timerRef.current, {
        duration: 0.5,
        scale: 1.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      })
    }
  }

  const animateDots = (): void => {
    if (dotsRef.current) {
      gsap.from(dotsRef.current.children, {
        duration: 0.5,
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </h2>
        <div ref={timerRef} className="text-6xl font-bold mb-6">
          {formatTime(timeLeft)}
        </div>
        <Progress value={calculateProgress()} className="w-full h-4 mb-6" />
        <div ref={dotsRef} className="flex justify-center space-x-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                i < sessionCount % 4 ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button onClick={toggleTimer} className="px-8 py-3 text-lg">
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          onClick={() => setTimeLeft(sessionTime * 60)}
          className="px-8 py-3 text-lg"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <Label htmlFor="sessionTime" className="mb-2 block">
            Focus Time (minutes)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="sessionTime"
              type="number"
              value={sessionTime}
              onChange={(e) => setSessionTime(Number(e.target.value))}
              className="w-20"
            />
            <Slider
              min={1}
              max={60}
              step={1}
              value={[sessionTime]}
              onValueChange={(value) => setSessionTime(value[0])}
              className="flex-grow"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="breakTime" className="mb-2 block">
            Break Time (minutes)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="breakTime"
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              className="w-20"
            />
            <Slider
              min={1}
              max={30}
              step={1}
              value={[breakTime]}
              onValueChange={(value) => setBreakTime(value[0])}
              className="flex-grow"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="longBreakTime" className="mb-2 block">
            Long Break Time (minutes)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="longBreakTime"
              type="number"
              value={longBreakTime}
              onChange={(e) => setLongBreakTime(Number(e.target.value))}
              className="w-20"
            />
            <Slider
              min={1}
              max={60}
              step={1}
              value={[longBreakTime]}
              onValueChange={(value) => setLongBreakTime(value[0])}
              className="flex-grow"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="track-progress"
          checked={trackProgress}
          disabled={true}
          onCheckedChange={setTrackProgress}
        />
        <Label htmlFor="track-progress">Track Progress (In development)</Label>
      </div>

      <Alert>
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Local Storage Only</AlertTitle>
        <AlertDescription>
          Currently, all progress is stored locally in your browser. Your data
          will be lost if you clear your browser data.
        </AlertDescription>
      </Alert>

      <ImprovedStatistics
        totalFocusTime={formatTime(totalFocusTime)}
        totalBreakTime={formatTime(totalBreakTime)}
        totalLongBreakTime={formatTime(totalLongBreakTime)}
      />

      <div className="text-center text-xl font-semibold">
        Sessions completed: {sessionCount}
      </div>
    </div>
  )
}
