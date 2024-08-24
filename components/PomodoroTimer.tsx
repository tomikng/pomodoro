'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
  const [showAlert, setShowAlert] = useState<boolean>(false)

  const timerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/alert-sound.mp3') // Make sure to add this sound file to your public folder
  }, [])

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

  useEffect(() => {
    if (!isRunning && !isBreak) {
      setTimeLeft(sessionTime * 60)
    }
  }, [sessionTime, isRunning, isBreak])

  const handleSessionEnd = (): void => {
    setIsRunning(false)
    if (audioRef.current) {
      audioRef.current.play()
    }
    setShowAlert(true)
  }

  const toggleTimer = (): void => setIsRunning(!isRunning)

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  const calculateProgress = (): number => {
    const totalTime = isBreak
      ? sessionCount % 4 === 0
        ? longBreakTime * 60
        : breakTime * 60
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

  const handleSessionTimeChange = (value: number | string) => {
    const newValue = Math.max(1, Math.min(60, Number(value) || 1))
    setSessionTime(newValue)
    if (!isRunning && !isBreak) {
      setTimeLeft(newValue * 60)
    }
  }

  const handleBreakTimeChange = (value: number | string) => {
    const newValue = Math.max(1, Math.min(30, Number(value) || 1))
    setBreakTime(newValue)
    if (!isRunning && isBreak && sessionCount % 4 !== 0) {
      setTimeLeft(newValue * 60)
    }
  }

  const handleLongBreakTimeChange = (value: number | string) => {
    const newValue = Math.max(1, Math.min(60, Number(value) || 1))
    setLongBreakTime(newValue)
    if (!isRunning && isBreak && sessionCount % 4 === 0) {
      setTimeLeft(newValue * 60)
    }
  }

  const handleAddFiveMinutes = () => {
    setTimeLeft((prev) => prev + 4 * 60)
    setShowAlert(false)
    setIsRunning(true)
  }

  const handleFinishSession = () => {
    setShowAlert(false)
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
    setIsRunning(true)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </h2>
        <div
          ref={timerRef}
          className="text-5xl md:text-6xl font-bold mb-4 md:mb-6"
        >
          {formatTime(timeLeft)}
        </div>
        <Progress
          value={calculateProgress()}
          className="w-full h-3 md:h-4 mb-4 md:mb-6"
        />
        <div ref={dotsRef} className="flex justify-center space-x-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                i < sessionCount % 4 ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={toggleTimer}
          className="px-6 py-2 md:px-8 md:py-3 text-base md:text-lg"
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          onClick={() => setTimeLeft(sessionTime * 60)}
          className="px-6 py-2 md:px-8 md:py-3 text-base md:text-lg"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div>
          <Label htmlFor="sessionTime" className="mb-2 block">
            Focus Time (minutes)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="sessionTime"
              type="number"
              value={sessionTime}
              onChange={(e) => handleSessionTimeChange(e.target.value)}
              onBlur={(e) => handleSessionTimeChange(e.target.value)}
              min={1}
              max={60}
              className="w-16 md:w-20"
            />
            <Slider
              min={1}
              max={60}
              step={1}
              value={[sessionTime]}
              onValueChange={(value) => handleSessionTimeChange(value[0])}
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
              onChange={(e) => handleBreakTimeChange(e.target.value)}
              onBlur={(e) => handleBreakTimeChange(e.target.value)}
              min={1}
              max={30}
              className="w-16 md:w-20"
            />
            <Slider
              min={1}
              max={30}
              step={1}
              value={[breakTime]}
              onValueChange={(value) => handleBreakTimeChange(value[0])}
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
              onChange={(e) => handleLongBreakTimeChange(e.target.value)}
              onBlur={(e) => handleLongBreakTimeChange(e.target.value)}
              min={1}
              max={60}
              className="w-16 md:w-20"
            />
            <Slider
              min={1}
              max={60}
              step={1}
              value={[longBreakTime]}
              onValueChange={(value) => handleLongBreakTimeChange(value[0])}
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
        <Label htmlFor="track-progress" className="text-sm md:text-base">
          Track Progress (In development)
        </Label>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
        <AlertTitle className="text-sm md:text-base">
          Local Storage Only
        </AlertTitle>
        <AlertDescription className="text-xs md:text-sm">
          Currently, all progress is stored locally in your browser. Your data
          will be lost if you clear your browser data.
        </AlertDescription>
      </Alert>

      <ImprovedStatistics
        totalFocusTime={formatTime(totalFocusTime)}
        totalBreakTime={formatTime(totalBreakTime)}
        totalLongBreakTime={formatTime(totalLongBreakTime)}
      />

      <div className="text-center text-lg md:text-xl font-semibold">
        Sessions completed: {sessionCount}
      </div>

      <Dialog open={showAlert} onOpenChange={setShowAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBreak ? 'Break Finished' : 'Session Finished'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isBreak
              ? 'Your break time is over. Ready to focus again?'
              : "Great job! You've completed a focus session. Time for a break?"}
          </div>
          <DialogFooter className="sm:justify-start">
            <Button onClick={handleAddFiveMinutes}>Add 5 Minutes</Button>
            <Button onClick={handleFinishSession}>
              {isBreak ? 'Start Focus Session' : 'Start Break'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
