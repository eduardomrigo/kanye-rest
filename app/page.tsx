'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RefreshCw, Quote, Search, X } from 'lucide-react'
import Link from 'next/link'

export default function KanyeQuotes() {
  const [quotes, setQuotes] = useState<string[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<string[]>([])
  const [currentQuote, setCurrentQuote] = useState<string>('')
  const [displayedQuote, setDisplayedQuote] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [showImage, setShowImage] = useState<boolean>(false)
  const [isMouthOpen, setIsMouthOpen] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/sounds/typing.mp3')
    audioRef.current.loop = true
  }, [])

  const fetchQuotes = useMemo(() => async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://api.kanye.rest/quotes')
      const data = await response.json()
      setQuotes(data)
      setFilteredQuotes(data)
      const newQuote = data[Math.floor(Math.random() * data.length)]
      setCurrentQuote(newQuote)
      setDisplayedQuote('')
    } catch (error) {
      console.error('Error fetching quotes:', error)
      setQuotes([])
      setFilteredQuotes([])
      setCurrentQuote('Failed to fetch quotes. Please try again.')
      setDisplayedQuote('Failed to fetch quotes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  useEffect(() => {
    const filtered = quotes.filter(quote =>
      quote.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredQuotes(filtered)
  }, [searchTerm, quotes])

  useEffect(() => {
    if (currentQuote && audioRef.current) {
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < currentQuote.length) {
          setDisplayedQuote(currentQuote.slice(0, i + 1))
          setIsMouthOpen(prev => !prev)
          i++
          if (audioRef.current!.paused) {
            audioRef.current!.play()
          }
        } else {
          clearInterval(typingInterval)
          audioRef.current!.pause()
          audioRef.current!.currentTime = 0
          setIsMouthOpen(false)
        }
      }, 50)

      // Adjust audio playback rate based on quote length
      const playbackRate = Math.max(0.5, Math.min(2, 20 / currentQuote.length))
      audioRef.current.playbackRate = playbackRate

      return () => {
        clearInterval(typingInterval)
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      }
    }
  }, [currentQuote])

  const findQuote = () => {
    const matchingQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)]
    setCurrentQuote(matchingQuote || 'No matching quotes found.')
    setDisplayedQuote('')
  }

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
    if (isSearchOpen) {
      setSearchTerm('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg.png')] bg-cover relative bg-no-repeat bg-right p-4">
      <div className="relative w-full max-w-md">
        <AnimatePresence>
          {showImage && (
            <motion.div
              className="absolute right-[25px] rotate-6 z-0 w-[120px] h-[180px] rounded-lg overflow-hidden"
              initial={{ top: 0 }}
              animate={{ top: -150 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={isMouthOpen ? "open" : "closed"}
                  src={isMouthOpen ? "/open2.png" : "/close.png"}
                  alt={`Kanye West ${isMouthOpen ? "speaking" : "not speaking"}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <Card
          className="w-full relative z-10"
          onMouseEnter={() => setShowImage(true)}
        >
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Kanye West Quotes</CardTitle>
            <CardDescription className="text-center">Wisdom from Ye</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center space-x-2"
                  >
                    <Input
                      type="text"
                      placeholder="Filter quotes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow"
                      aria-label="Search quotes"
                    />
                    <Button
                      onClick={findQuote}
                      disabled={isLoading || filteredQuotes.length === 0}
                      size="sm"
                    >
                      Find
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Quote className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-lg font-medium h-24 flex items-center justify-center">{displayedQuote}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={fetchQuotes}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : 'Refresh Quotes'}
            </Button>
          </CardFooter>
          <Button
            onClick={handleSearchToggle}
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 rounded-full"
            aria-label={isSearchOpen ? "Close search" : "Open search"}
          >
            {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </Card>
      </div>
      <Link className='p-5 absolute bottom-0 right-0' href="https://eduardev.com">
        <p className='font-mono font-semibold'>/eduardev</p>
      </Link>
    </div>
  )
}