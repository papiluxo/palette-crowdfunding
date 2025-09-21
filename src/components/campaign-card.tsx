'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, Target, Gift, Calendar } from 'lucide-react'
import { formatUSDFromSOLSync } from '@/lib/utils'
import { useSOLPrice } from '@/contexts/price-context'

interface Campaign {
  id: string
  artistName: string
  title: string
  blurb: string
  goalAmount: number
  raisedAmount: number
  thumbnailUrl?: string
  endDate: string
  supporterCount: number
  tokenPerks: string[]
}

interface CampaignCardProps {
  campaign: Campaign
  index: number
}

export function CampaignCard({ campaign, index }: CampaignCardProps) {
  const { solPrice } = useSOLPrice()
  const progressPercentage = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
  const router = useRouter()
  const goToDetail = () => router.push(`/campaigns/${campaign.id}`)

  // Note: Removed prefetching to avoid compilation issues

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
        <Card
          role="link"
          tabIndex={0}
          onClick={goToDetail}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              goToDetail()
            }
          }}
          className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        >
          {/* Thumbnail */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
            {campaign.thumbnailUrl ? (
              <img 
                src={campaign.thumbnailUrl} 
                alt={campaign.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                    <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"></path>
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
              {daysLeft} days left
            </div>
          </div>

          <CardHeader className="pb-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{campaign.artistName}</span>
              </div>
              <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {campaign.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {campaign.blurb}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Raised</span>
                <span className="font-medium">
                  ${campaign.raisedAmount.toLocaleString()} of ${campaign.goalAmount.toLocaleString()} USDT
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{campaign.raisedAmount.toLocaleString()} USDT</span>
                <span>Goal: {campaign.goalAmount.toLocaleString()} USDT</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressPercentage.toFixed(1)}% funded</span>
                <span>{campaign.supporterCount} supporters</span>
              </div>
            </div>

            {/* Token Perks Preview */}
            {campaign.tokenPerks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Gift className="h-4 w-4" />
                  <span>Token Perks</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {campaign.tokenPerks.slice(0, 3).map((perk, i) => (
                    <span 
                      key={i}
                      className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                    >
                      {perk}
                    </span>
                  ))}
                  {campaign.tokenPerks.length > 3 && (
                    <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                      +{campaign.tokenPerks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <Button className="w-full" size="lg" onClick={(e) => { e.stopPropagation(); goToDetail() }}>
              View Campaign Details
            </Button>
          </CardContent>
        </Card>
    </motion.div>
  )
} 