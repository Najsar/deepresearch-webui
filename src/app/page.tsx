import { DeepResearchChat } from '@/components/DeepResearchChat'
import { EventLogger } from '@/components/EventLogger'

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-zinc-950">
      <div className="w-[80%] mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
          Deep Research Chat
        </h1>
        <DeepResearchChat />
      </div>
      <EventLogger />
    </main>
  )
} 